const EventEmitter = require('events').EventEmitter
const path = require('path')
const chokidar = require('chokidar')

function needsReinstall (file) {
  const installers = [
    'package.json',
    'yarn.lock'
  ]
  return installers.indexOf(file.toLowerCase()) > -1
}
class Watcher {
  constructor (options) {
    this._emitter = new EventEmitter()
    const opts = {
      ignored: '**/node_modules/**',
      ignoreInitial: true
    }
    const watcher = chokidar.watch(options.source, opts)
    this.watcher = watcher
  }

  start () {
    const handler = (type, f) => {
      const fname = path.basename(f)
      // always emit sync to transfer new install directives
      this._emit('sync', f)
      if (needsReinstall(fname)) {
        // TODO: emit type as well as filename and check e.g. deleted package.json
        this._emit('install', f)
      }
    }
    this.watcher
      .on('add', handler.bind(this, 'add'))
      .on('change', handler.bind(this, 'change'))
      .on('unlink', handler.bind(this, 'remove'))
  }

  getEventEmitter () {
    return this._emitter
  }

  _emit (...args) {
    this._emitter.emit(...args)
  }

  close () {

  }
}

module.exports = Watcher
