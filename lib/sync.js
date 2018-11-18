const path = require('path')
const Rsync = require('rsync')

class Sync {
  constructor (opts) {
    this.options = opts
    this.rsync = new Rsync()
      .shell(`ssh -i ${opts.ssh.keyfilePath} -p ${opts.ssh.port}`)
      .archive()
      .delete() // also delete removed local files on remote
      .compress()
      .dirs()
      .exclude('node_modules/')
      .exclude('.git/')
      .source(path.join(opts.source, '/'))
      .destination(`${opts.ssh.username}@${opts.ssh.host}:${path.join(opts.target)}`)
    this.syncInProgress = false
    return this
  }

  addStdOutStream (stream) {
    this.stdOutStream = stream
    return this
  }

  addStdErrStream (stream) {
    this.stdErrStream = stream
    return this
  }

  execute () {
    this.syncInProgress = true
    return new Promise((resolve, reject) => {
      this.rsync.execute((err, resCode) => {
        if (err) {
          return reject(err)
        }
        this.syncInProgress = false
        resolve(resCode)
      },
      this.stdOutStream,
      this.stdErrStream)
    })
  }
}

module.exports = Sync
