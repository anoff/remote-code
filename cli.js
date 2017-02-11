#!/usr/bin/env node
const chalk = require('chalk');
const RemoteCode = require('.');

const options = {
	ssh: {
		host: '192.168.2.5',
		port: 2221,
		username: 'pi',
		keyfilePath: '/Users/anoff/.ssh/id_pi',
		keepaliveInterval: 500,
		readyTimeout: 2000
	},
	source: '/developer/anoff/dummyApp',
	target: '/home/pi/dummyApp'
};

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
