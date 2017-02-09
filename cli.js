#!/usr/bin/env node
const split = require('split');
const meow = require('meow');
const RemoteCode = require('.');

const sshSettings = {
	host: '192.168.2.5',
	port: 2221,
	username: 'pi',
	privateKey: require('fs').readFileSync('/Users/anoff/.ssh/id_pi'),
	keepaliveInterval: 500,
	readyTimeout: 2000
};

const options = {
	ssh: sshSettings,
	project: '/developer/anoff/'
};

const remoteCode = new RemoteCode(options);
const liveSsh = remoteCode.ssh.liveReload;
liveSsh.connect(sshSettings);

// make node process interactive by passing stdin to the remote shell
process.stdin.pipe(split()).on('data', line => {
	liveSsh.send(line);
});
