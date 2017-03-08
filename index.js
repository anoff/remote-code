const EventEmitter = require('events');
const stream = require('stream');
const Watcher = require('./lib/watcher');
const Ssh = require('./lib/ssh');
const Sync = require('./lib/sync');

const devNull = new stream.Writable();
devNull._write = () => null;

class RemoteCode {
	constructor(opts = {}) {
		this.options = opts;
		this.emitter = new EventEmitter();
		this.ssh = {
			liveReload: new Ssh()
		};
		this.verbose = opts.verbose || false;
		this.stdout = opts.stdout instanceof stream.Writable ? opts.stdout : new stream.Writable();
		this.stderr = opts.stderr instanceof stream.Writable ? opts.stderr : new stream.Writable();
		this.watcher = new Watcher(opts);
		this.sync = new Sync(opts)
			.addStdOutStream(this.stdout)
			.addStdErrStream(this.stderr);

		return this;
	}

	syncCode() {
		this.emitter.emit('sync');
		return this.sync.execute();
	}

	_getStdOut() {
		if (this.verbose) {
			return this.stdout;
		}
		return devNull;
	}

	_getStdErr() {
		if (this.verbose) {
			return this.stderr;
		}
		return devNull;
	}

	watch() {
		this.watcher.start();
		const watchEmitter = this.watcher.getEventEmitter();
		watchEmitter.on('sync', () => {
			this.syncCode();
		});
		watchEmitter.on('install', () => {
			return this.install()
			.then(() => {
				this.ssh.liveReload.send('rs');
			});
		});
		return this.emitter;
	}

	start() {
		this.emitter.emit('start');
		const sshSettings = this.options.ssh;
		return Promise.all([this.syncCode(), this.watch()])
			.then(() => this.install())
			.then(() => this.ssh.liveReload.connect(sshSettings))
			.then(() => {
				this.emitter.emit('nodemon', 'start');
				this.ssh.liveReload.send(`cd ${this.options.target} && ${this.options.start}`);
			})
			.catch(this._abort.bind(this));
	}

	// execute a single command and then resolve
	execute(cmd, stdout, stderr) {
		this.emitter.emit('exec', cmd);
		const ssh = new Ssh();
		return ssh.exec(this.options.ssh, cmd, stdout, stderr);
	}

	install() {
		this.emitter.emit('install', 'triggered');
		if (!this.installInProgress) {
			this.emitter.emit('install', 'started');
			this.installInProgress = true;
			return this.execute(`cd ${this.options.target} && ${this.options.install}`, this._getStdOut(), this._getStdErr())
			.then(res => {
				this.emitter.emit('install', 'ended', res);
				this.installInProgress = false;
				// console.log(res);
				return res;
			});
		}
		return Promise.resolve();
	}

	close() {
		this.emitter.emit('close');
		return Promise.all([this.watcher.close(),
			this.ssh.liveReload.close()]);
	}

	_abort(err) {
		this.emitter.emit('error', err);
	}
}

module.exports = RemoteCode;
