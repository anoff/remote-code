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
		this.watcher = new Watcher();
		this.sync = new Sync(opts)
			.addStdErrStream(console.err)
			.addStdOutStream(console.log);
		return this;
	}

	syncCode() {
		return this.sync.execute();
	}

	start(opts = {}) {
		this.options = Object.assign(this.options, opts);
		const sshSettings = this.options.ssh;
		return Promise.all([this.ssh.liveReload.connect(sshSettings),
			this.ssh.installer.connect(sshSettings),
			this.syncCode()]);

	}
}

module.exports = RemoteCode;
