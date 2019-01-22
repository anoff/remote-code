#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const stream = require('stream')
const url = require('ssh-url')
const chalk = require('chalk')
const meow = require('meow')
const updateNotifier = require('update-notifier')
const pkg = require('./package.json')
const RemoteCode = require('./index')

// check for new version
updateNotifier({ pkg }).notify()

const cli = meow(`
  Usage
    $ remote-code <[user@]host>

    This will happen:
    ✈️  sync local directory content with remote dir
    📦  run 'npm install' to install dependencies
    👀  open a ssh stream to view remote output
    🔃  run 'nodemon .' in the remote directory

    Note: Without specifying --source and/or --target default dirs will be used. You should only do this for testing as the directory could be dirty from previous runs.


  Options
    --identity-file,  -i    SSH keyfile
    --install-cmd,    -I    installation / setup command [npm install]
    --port,           -p    Custom port [22]
    --source,         -s    directory to synchronize (local) [CWD]
    --start-cmd,      -S    command to start on remote (should implement a file watcher) [nodemon .]
    --target,         -t    remote location to sync to ["~/remote-sync"]
    --user,           -u    SSH username
    --verbose,        -v    log all the things

  Examples
    $ remote-code user@192.168.0.4
    $ remote-code -p 23 -i ~/.ssh/id_rsa --user admin 192.168.0.4
    $ remote-code -i ~/.ssh/id_rsa pi@192.168.0.4 --source ~/myProject --target "~/myProject"
    $ remote-code -i ~/.ssh/id_rsa pi@192.168.0.4 -S 'sudo \`which node\` johnny5' -I "npm install"
`, {
  flags: {
    port: {
      type: 'number',
      alias: 'p'
    },
    identityFile: {
      type: 'string',
      alias: 'i'
    },
    installCmd: {
      type: 'string',
      alias: 'I'
    },
    user: {
      type: 'string',
      alias: 'u'
    },
    source: {
      type: 'string',
      alias: 's'
    },
    startCmd: {
      type: 'string',
      alias: 'S'
    },
    target: {
      type: 'string',
      alias: 't'
    },
    verbose: {
      type: 'boolean',
      alias: 'v'
    },
    debug: {
      type: 'boolean'
    }
  }
})

// show help if no host is supplied
if (cli.input.length === 0) {
  console.log(cli.help)
  process.exit()
}
// parse argument for user/host
const parts = url.parse(cli.input[0])
const options = {
  ssh: {
    host: parts.hostname,
    port: cli.flags.port || 22,
    username: cli.flags.user || parts.user,
    keyfilePath: cli.flags.identityFile,
    keepaliveInterval: 500,
    readyTimeout: 2000
  },
  install: cli.flags.installCmd || 'npm install',
  source: path.normalize(cli.flags.source || process.cwd()),
  start: cli.flags.startCmd || 'nodemon .',
  target: cli.flags.target || '~/remote-sync',
  verbose: cli.flags.verbose,
  debug: cli.flags.debug
}
if (options.debug) {
  console.log('Parsed arguments:', options)
}
// check for missing options
if (!options.ssh.host) {
  console.error('Please provide a valid host')
  process.exit(1)
}
if (!options.ssh.username) {
  console.error('Please provide a valid username')
  process.exit(1)
}
if (!options.ssh.keyfilePath || !fs.existsSync(options.ssh.keyfilePath)) {
  console.error('SSH identity file does not exist:', options.ssh.keyfilePath)
  process.exit(1)
}
if (!fs.existsSync(options.source)) {
  console.error('Source directory does not exist:', options.source)
  process.exit(1)
}
// verbose stream processing
const verbOut = new stream.Transform({
  transform: function (chunk, enc, cb) {
    cb(null, chalk.dim(chunk))
  }
})

// apply dim style to verbose logs
verbOut.pipe(process.stdout)

options.stderr = process.stderr
options.stdout = verbOut
const remoteCode = new RemoteCode(options)

// turn everything magenta
function log (...data) {
  console.log(chalk.magenta(...data))
}

// add console output for livefeed (process on the remote)
const liveSsh = remoteCode.ssh.liveReload
liveSsh.getEventEmitter()
  .on('connect', () => log('👀\tlive-feed connected..'))
  .on('close', () => {
    log('👀\tlive-feed closed')
    // end the node process
    process.exit(0)
  })
  .on('error', s => console.log(chalk.bold.red(s)))
  .on('data', data => process.stdout.write(chalk.blue(data.toString())))

// add generic output for the overall process of the remotecode execution
remoteCode.emitter
  .on('start', () => log('🐪\tstarting remote-code'))
  .on('install', s => {
    // do not log 'triggered' unless in verbose mode
    if (options.verbose || s !== 'triggered') {
      log(`📦\tdependency installation ${s}`)
    }
  })
  .on('startCmd', s => log(`🔃\t${s} '${options.start}'`))
  .on('close', () => log('🐪\tshutting down remote-code'))
  .on('sync', () => log('✈️\tsyncing files'))
  .on('error', e => {
    console.log(`💣\t${chalk.red(e)}`)
    remoteCode.close()
      .then(() => process.exit(1))
  })

// start remotecode procedure
remoteCode.start()

// listen for ctrl+c on terminal
process.on('SIGINT', () => remoteCode.close())
