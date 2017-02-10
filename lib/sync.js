const Rsync = require('rsync');

class Sync {
	constructor(opts) {
		this.options = opts;
		this.rsync = new Rsync()
		.shell(`ssh -i ${opts.ssh.keyPath}`)
		.archive()
		.compress()
		.source(opts.source)
		.destination(`${opts.ssh.host}:${opts.target}`)
		.set('port', opts.ssh.port);
		return this;
	}

	addStdOutStream(stream) {
		this.stdOutStream = stream;
		return this;
	}

	addStdErrStream(stream) {
		this.stdErrStream = stream;
		return this;
	}

	execute() {
		console.log(this.rsync.command())
		return new Promise((resolve, reject) => {
			this.rsync.execute((err, resCode) => {
				if (err) {
					return reject(err);
				}
				resolve(resCode);
			},
			this.stdOutStream,
			this.stdErrStream);
		});
	}
}

module.exports = Sync;
