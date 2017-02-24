#!/usr/bin/env node
const path = require('path');
const stream = require('stream');
const url = require('ssh-url');
const chalk = require('chalk');
const meow = require('meow');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const RemoteCode = require('.');

// check for new version
updateNotifier({pkg}).notify();

const cli = meow(`
	Usage
		$ remote-code <[user@]host>

		This will happen:
		✈️	sync local directory content with remote dir
		📦	run 'yarn' to install dependencies
		👀	open a ssh stream to view remote output
		🔃	run 'nodemon .' in the remote directory

		Note: Without specifying --source and/or --target default dirs will be used. You should only do this for testing as the directory could be dirty from previous runs.


	Options
		--port, -p		Custom port [22]
		--identity-file, -i	SSH keyfile
		--user, -u		SSH username
		--password, -P		SSH password (not supported)
		--source, -s 		directory to synchronize (local) [CWD]
		--target, -t 		remote location to sync to [~/remote-sync]
		--verbose, -v 		log all the things

	Examples
		$ remote-code user@192.168.0.4
		$ remote-code -p 23 -i ~/.ssh/id_rsa --user admin 192.168.0.4
		$ remote-code -i ~/.ssh/id_rsa pi@192.168.0.4 --source ~/myProject --target ~/myProject
`, {
	alias: {
		p: 'port',
		i: 'identity-file',
		u: 'user',
		P: 'password',
		s: 'source',
		t: 'target',
		v: 'verbose'
	}
});

if (cli.input.length === 0) {
	console.log(cli.help);
	process.exit();
}
// parse argument for user/host
const parts = url.parse(cli.input[0]);
const options = {
	ssh: {
		host: parts.hostname,
		port: cli.flags.port || 22,
		username: cli.flags.user || parts.user,
		keyfilePath: cli.flags.identityFile,
		password: cli.flags.password,
		keepaliveInterval: 500,
		readyTimeout: 2000
	},
	source: path.normalize(cli.flags.source || process.cwd()),
	target: cli.flags.target || '~/remote-sync',
	verbose: cli.flags.verbose
};

// check for missing options
if (!options.ssh.host) {
	console.log('Please provide a valid host');
	process.exit();
}

if (!options.ssh.username) {
	console.log('Please provide a valid username');
	process.exit();
}

// verbose stream processing
const verbOut = new stream.Transform({
	transform: function (chunk, enc, cb) {
		cb(null, chalk.dim(chunk));
	}
});

// apply dim style to verbose logs
verbOut.pipe(process.stdout);

options.stderr = process.stderr;
options.stdout = verbOut;
const remoteCode = new RemoteCode(options);

// parse liveReload connection output
function log(...data) {
	console.log(chalk.magenta(...data));
}

const liveSsh = remoteCode.ssh.liveReload;
liveSsh.getEventEmitter()
	.on('connect', () => log('👀\tlive-feed connected..'))
	.on('close', () => {
		log('👀\tlive-feed closed');
		// end the node process
		process.exit(0);
	})
	.on('error', s => console.log(chalk.bold.red(s)))
	.on('data', data => process.stdout.write(chalk.blue(data.toString())));

remoteCode.emitter
	.on('start', () => log('🐪\tstarting remote-code'))
	.on('install', s => {
		// do not log 'triggered' unless in verbose mode
		if (options.verbose || s !== 'triggered') {
			log(`📦\tdependency installation ${s}`);
		}
	})
	.on('nodemon', () => log('🔃\tnodemon process started'))
	.on('close', () => log('🐪\tshutting down remote-code'))
	.on('sync', () => log('✈️\tsyncing files'))
	.on('error', e => {
		console.log(`💣\t${chalk.red(e)}`);
		remoteCode.close()
		.then(() => process.exit());
	});

remoteCode.start();

process.on('SIGINT', () => remoteCode.close());
// TODO:
// - figure out proper way to sync folder, default create new?!

