const ssh = require('ssh2');
const split = require('split');
const chalk = require('chalk');

const Client = ssh.Client;

class Ssh extends Client {

	constructor() {
		super();
		return this.init();
	}

	init() {
		const conn = this;
		conn.on('ready', () => {
			conn.shell((err, stream) => {
				if (err) {
					throw err;
				}
				console.log(chalk.magenta('Connection established'));
				this.stream = stream;
				stream.on('close', () => {
					console.log(chalk.magenta('Connection closed'));
					conn.end();
					// TODO: remove process exit and replace with subscribable events
					process.exit();
				});
				stream.pipe(split()).on('data', data => {
					console.log(chalk.cyan(data));
				});
				stream.stderr.pipe(split()).on('data', data => {
					console.log(chalk.red.bold(data));
				});
			});
		});
		return this;
	}

	connect() {
		const p = super.connect({
			host: '192.168.2.4',
			port: 2221,
			username: 'pi',
			privateKey: require('fs').readFileSync('/Users/anoff/.ssh/id_pi'),
			keepaliveInterval: 500,
			readyTimeout: 2000
		});
		return this;
	}

	send(line) {
		this.stream.write(`${line}\n`);
	}
}

module.exports = new Ssh();
