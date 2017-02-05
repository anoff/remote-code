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
				this.stream = stream;
				console.log(chalk.magenta('Connection established'));
				stream.on('close', () => {
					console.log(chalk.magenta('Connection closed'));
					conn.end();
					// TODO: remove process exit and replace with subscribable events
					process.exit();
				});
				stream.on('data', data => {
					process.stdout.write(chalk.blue(data.toString()));
				});
				stream.stderr.pipe(split()).on('data', data => {
					console.log(chalk.red.bold(data));
				});
			});
		});
		return this;
	}

	connect(opts) {
		super.connect(opts);
		return this;
	}

	send(line) {
		this.stream.write(`${line}\n`);
	}
}

module.exports = Ssh;
