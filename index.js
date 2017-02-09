const EventEmitter = require('events');
const Ssh = require('./lib/ssh');

class RemoteCode {
	constructor(opts) {
		this.options = opts;
		this.emitter = new EventEmitter();
		this.ssh = {
			liveReload: new Ssh()
		};
		return this;
	}
}

module.exports = RemoteCode;
