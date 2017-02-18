const EventEmitter = require('events');
const Watcher = require('./lib/watcher');
const Ssh = require('./lib/ssh');
const Sync = require('./lib/sync');

class RemoteCode {
	constructor(opts = {}) {
		this.options = opts;
		this.emitter = new EventEmitter();
		this.ssh = {
			liveReload: new Ssh(),
			installer: new Ssh()
		};
		this.watcher = new Watcher(opts);
		this.sync = new Sync(opts)
			.addStdErrStream(process.stderr)
			.addStdOutStream(process.stdout);
		return this;
	}

	syncCode() {
		return this.sync.execute();
	}

	watch() {
		this.watcher.start();
		const emitter = this.watcher.getEventEmitter();
		emitter.on('sync', () => {
			this.syncCode();
		});
		emitter.on('install', () => {
			this.syncCode()
			.then(() => {
				// TODO: restart nodemon
			});
		});
		return this.emitter;
	}

	start() {
		const options = this.options;
		const sshSettings = this.options.ssh;
		return Promise.all([this.ssh.liveReload.connect(sshSettings),
			this.ssh.installer.connect(sshSettings),
			this.syncCode(), this.watch()])
			.then(() => {
				const lr = this.ssh.liveReload;
				lr.send(`cd ${options.target} && yarn && nodemon .`);
			});
	}

	close() {
		return Promise.all([this.watcher.close(),
			this.ssh.installer.end(), this.ssh.liveReload.end()]);
	}
}

module.exports = RemoteCode;
