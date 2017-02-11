#!/usr/bin/env node
const split = require('split');
const meow = require('meow');
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
const liveSsh = remoteCode.ssh.liveReload;
let chunks = '';
let ignoreStdOut = []; // array to hold commands that should be kept from showing up on stdout
liveSsh.getEventEmitter()
	.on('connect', s => console.log(chalk.magenta(s)))
	.on('close', s => {
		console.log(chalk.magenta(s));
		// end the node process once livechannel is gone (e.g. typing exit)
		process.exit(0);
	})
	.on('error', s => console.log(chalk.bold.red(s)))
	.on('data', data => {
		if (ignoreStdOut.length > 0) {
			chunks += data;
			ignoreStdOut.forEach((cmd, i) => {
				if (cmd + '\r\n' === chunks || cmd + '\n' === chunks) {
					chunks = '';
					ignoreStdOut.splice(i, 1);
				} else if (chunks.slice(-1) === '\n') {
					ignoreStdOut.forEach(() => ignoreStdOut.pop());
				}
			});
		} else {
			process.stdout.write(chalk.blue(data.toString()));
		}
	});

// make node process interactive by passing stdin to the remote shell
process.stdin.pipe(split()).on('data', line => {
	ignoreStdOut.push(line); // prevent this line from showing up in stdout
	liveSsh.send(line);
});

remoteCode.start();
