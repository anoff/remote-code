const EventEmitter = require('events');
const Ssh = require('./lib/ssh');
const Sync = require('./lib/sync');

class RemoteCode {
	constructor(opts) {
		this.options = opts;
		this.emitter = new EventEmitter();
		this.ssh = {
			liveReload: new Ssh()
		};
		this.sync = new Sync(opts)
			.addStdErrStream(console.err)
			.addStdOutStream(console.log);
		return this;
	}

	syncCode() {
		console.log(this)
		return this.sync.execute();
	}
}

module.exports = RemoteCode;
