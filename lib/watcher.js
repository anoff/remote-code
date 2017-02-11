const EventEmitter = require('events').EventEmitter;
const path = require('path');
const chokidar = require('chokidar');

function needsReinstall(file) {
	const installers = [
		'package.json',
		'yarn.lock'
	];
	return installers.indexOf(file.toLowerCase()) > -1;
}
class Watcher {
	constructor() {
		this._emitter = new EventEmitter();
	}

	start(options) {
		const opts = {
			ignored: '**/node_modules/**'
		};
		const watcher = chokidar.watch(options.source, opts);
		this.watcher = watcher;

		const handler = (type, f) => {
			const fname = path.basename(f);
			if (needsReinstall(fname)) {
				// TODO: emit type as well as filename and check e.g. deleted package.json
				this._emit('install', f);
			} else {
				this._emit('sync', f);
			}
		};
		watcher
			.on('add', handler.bind(this, 'add'))
			.on('change', handler.bind(this, 'change'))
			.on('unlink', handler.bind(this, 'remove'));
	}

	getEventEmitter() {
		return this._emitter;
	}

	_emit(...args) {
		this._emitter.emit(...args);
	}
}

module.exports = Watcher;
