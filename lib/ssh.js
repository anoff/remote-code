const fs = require('fs')
const EventEmitter = require('events').EventEmitter
const ssh = require('ssh2')

const Client = ssh.Client

class Ssh extends Client {
  constructor () {
    super()
    this._emitter = new EventEmitter()
    this._ignoreStdOut = []
  }

  init () {
    const conn = this
    conn.on('ready', () => {
      conn.shell((err, stream) => {
        if (err) {
          throw err
        }
        this.stream = stream
        this._emit('connect', 'Connection established')
        stream.on('close', () => {
          this._emit('close', 'Connection closed')
          conn.end()
        })
        stream.on('data', data => this._emit('data', data))
        stream.stderr.on('data', data => this._emit('error', data))
      })
    })
    return this
  }

  connect (opts = {}) {
    opts.privateKey = fs.readFileSync(opts.keyfilePath)
    super.connect(opts)
    return new Promise(resolve => {
      this.getEventEmitter().on('connect', () => resolve(this))
    })
  }

  getEventEmitter () {
    return this._emitter
  }

  _emit (...args) {
    this._emitter.emit(...args)
  }

  send (line) {
    this._ignoreStdOut.push(line)
    if (this.stream.writable) {
      this.stream.write(`${line}\n`)
    }
  }

  close () {
    this.end()
    this.stream = null
    return this
  }

  // execute a single command on the server and close & resolve
  // stdout, stderr are streams
  execute (opts, command = 'uptime', stdout, stderr) {
    return new Promise((resolve, reject) => {
      const conn = this
      conn
        .on('ready', () => {
          conn.exec(command, (err, stream) => {
            let data = ''
            if (err) {
              reject(err)
            }
            stream
              .on('close', (code, signal) => {
                conn.end()
                resolve({ code, data, signal })
              })
              .on('data', d => {
                data += d
                stdout.write(d)
              })
              .stderr.on('data', d => {
                data += d
                stderr.write(d)
              })
          })
        })
        .on('error', e => {
          reject(e)
          conn.end()
        })
        .connect(opts)
    })
  }
}

module.exports = Ssh
