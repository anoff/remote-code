const split = require('split');
const Ssh = require('./lib/ssh');
const path = require('path');
const EventEmitter = require('events');

const sshSettings = {
	host: '192.168.2.5',
	port: 2221,
	username: 'pi',
	privateKey: require('fs').readFileSync('/Users/anoff/.ssh/id_pi'),
	keepaliveInterval: 500,
	readyTimeout: 2000
};

class RemoteCode {
	constructor() {
		this.emitter = new EventEmitter();
		this.ssh = {
			liveReload: new Ssh()
		};
	}
}
const settings = {
	project: '/developer/anoff/'
};
const ssh = new Ssh();
ssh.connect(sshSettings);

// make node process interactive by passing stdin to the remote shell
process.stdin.pipe(split()).on('data', line => {
	ssh.send(line);
});

