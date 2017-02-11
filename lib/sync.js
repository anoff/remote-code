const Rsync = require('rsync');

class Sync {
	constructor(opts) {
		this.options = opts;
		this.rsync = new Rsync()
		.shell(`ssh -i ${opts.ssh.keyfilePath} -p ${opts.ssh.port}`)
		.archive()
		.compress()
		.exclude('node_modules/')
		.source(opts.source)
		.destination(`${opts.ssh.username}@${opts.ssh.host}:${opts.target}`);
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
