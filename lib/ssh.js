const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const ssh = require('ssh2');

const Client = ssh.Client;

class Ssh extends Client {

	constructor() {
		super();
		this._emitter = new EventEmitter();
		this._ignoreStdOut = [];
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
				this._emit('connect', 'Connection established');
				stream.on('close', () => {
					this._emit('close', 'Connection closed');
					conn.end();
				});
				stream.on('data', data => this._emit('data', data));
				stream.stderr.on('data', data => this._emit('error', data));
			});
		});
		return this;
	}

	connect(opts = {}) {
		opts.privateKey = fs.readFileSync(opts.keyfilePath);
		super.connect(opts);
		return this;
	}

	getEventEmitter() {
		return this._emitter;
	}

	_emit(...args) {
		this._emitter.emit(...args);
	}

	send(line) {
		this._ignoreStdOut.push(line);
		if (this.stream.writable) {
			this.stream.write(`${line}\n`);
		}
	}
}

module.exports = Ssh;
