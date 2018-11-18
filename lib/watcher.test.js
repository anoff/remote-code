import events from 'events'
import test from 'ava'
import td from 'testdouble'

const chokidarStub = {}

td.replace('chokidar', chokidarStub)
const Fn = require('./watcher')

function setup (stubs = {}) {
  chokidarStub.watch = stubs.watch || (() => new events.EventEmitter())
  return new Fn({ source: '.' })
}

test('should emit "sync" if file was added/changed/deleted', t => {
  t.plan(3)
  const fn = setup()
  fn.start()
  fn.getEventEmitter().on('sync', () => t.pass('file change detected'))
  fn.watcher.emit('add', 'file.txt')
  fn.watcher.emit('change', 'file.txt')
  fn.watcher.emit('unlink', 'file.txt')
})

test('should emit "install" if "package.json" or "yarn.lock" was added/changed/deleted', t => {
  t.plan(6)
  const fn = setup()
  fn.start()
  fn.getEventEmitter().on('install', () => t.pass('file change detected'))
  fn.watcher.emit('add', 'package.json')
  fn.watcher.emit('change', 'package.json')
  fn.watcher.emit('unlink', 'package.json')
  fn.watcher.emit('add', 'yarn.lock')
  fn.watcher.emit('change', 'yarn.lock')
  fn.watcher.emit('unlink', 'yarn.lock')
})

test('should emit "sync" if "package.json" or "yarn.lock" was added/changed/deleted', t => {
  t.plan(6)
  const fn = setup()
  fn.start()
  fn.getEventEmitter().on('sync', () => t.pass('file change detected'))
  fn.watcher.emit('add', 'package.json')
  fn.watcher.emit('change', 'package.json')
  fn.watcher.emit('unlink', 'package.json')
  fn.watcher.emit('add', 'yarn.lock')
  fn.watcher.emit('change', 'yarn.lock')
  fn.watcher.emit('unlink', 'yarn.lock')
})
