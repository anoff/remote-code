#!/usr/bin/env node
const path = require('path');
const url = require('ssh-url');
const chalk = require('chalk');
const meow = require('meow');
const RemoteCode = require('.');


const cli = meow(`
	Usage
		$ remote-code <[user@]host>

	Options
		--port, -p Custom port [22]
		--identity-file, -i SSH keyfile
		--user, -u SSH username
		--password, -P SSH password (not supported)
		--source, -s directory to synchronize (local) [CWD]
		--target, -t remote location to sync to [~]

	Examples
		$ remote-code user@192.168.0.4
		$ remote-code -p 23 -i ~/.ssh/id_rsa --user admin 192.168.0.4
`, {
	alias: {
		p: 'port',
		i: 'identity-file',
		u: 'user',
		P: 'password',
		s: 'source',
		t: 'target'
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
	target: cli.flags.target || '~'
};
console.log(options)
// check for missing options
!options.ssh.host && console.log('Please provide a valid host') && process.exit();
!options.ssh.username && console.log('Please provide a valid username') && process.exit();

const remoteCode = new RemoteCode(options);

// parse liveReload connection output
const liveSsh = remoteCode.ssh.liveReload;
liveSsh.getEventEmitter()
	.on('connect', s => console.log(chalk.magenta(s)))
	.on('close', s => {
		console.log(chalk.magenta(s));
		// end the node process once livechannel is gone (e.g. typing exit)
		process.exit(0);
	})
	.on('error', s => console.log(chalk.bold.red(s)))
	.on('data', data => process.stdout.write(chalk.blue(data.toString())));

remoteCode.start();
