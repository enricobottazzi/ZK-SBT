'use strict'

const assert = require('assert')
const fs = require('fs')
const stream = require('stream')
const Logger = require('../src/index')

const logfile = 'test123.log'

describe('logplease', function() {
  this.timeout(1000)

  before((done) => {
    done()
  })

  afterEach(() => {
    try {
      fs.statSync(logfile)
      fs.unlinkSync(logfile)
    } catch(e) {
    }
  })

  describe('Public API', () => {
    it('Colors', () => {
      assert(Logger.Colors)
    })

    it('LogLevels', () => {
      assert(Logger.Colors)
    })

    it('setLogLevel', () => {
      assert(Logger.Colors)
    })

    it('setLogfile', () => {
      assert(Logger.Colors)
    })

    it('create', () => {
      assert(Logger.create)
    })
  })

  describe('create', () => {
    it('creates a logger', (done) => {
      const log = Logger.create('test1')
      assert(log)
      assert.equal(log.category, 'test1')
      done()
    })

    it('uses default options', (done) => {
      const log = Logger.create('test1')
      assert(log)
      assert.equal(log.options.useColors, true)
      assert.equal(log.options.color, Logger.Colors.Default)
      assert.equal(log.options.showTimestamp, true)
      assert.equal(log.options.showLevel, true)
      assert.equal(log.options.filename, null)
      assert.equal(log.options.appendFile, true)
      done()
    })

    it('sets options', (done) => {
      const options = {
        useColors: false,
        color: Logger.Colors.Yellow,
        showTimestamp: false,
        useLocalTime: true,
        showLevel: false,
        filename: 'test.log',
        appendFile: false,
      }

      const log = Logger.create('test1', options)
      assert(log)
      assert.equal(log.options.useColors, false)
      assert.equal(log.options.color, Logger.Colors.Yellow)
      assert.equal(log.options.showTimestamp, false)
      assert.equal(log.options.useLocalTime, true)
      assert.equal(log.options.showLevel, false)
      assert.equal(log.options.filename, 'test.log')
      assert.equal(log.options.appendFile, false)
      done()
    })

    it('sets some options', (done) => {
      const options = {
        useColors: false,
        color: Logger.Colors.Yellow,
      }

      const log = Logger.create('test1', options)
      assert(log)
      assert.equal(log.options.useColors, false)
      assert.equal(log.options.color, Logger.Colors.Yellow)
      assert.equal(log.options.showTimestamp, true)
      assert.equal(log.options.useLocalTime, false)
      assert.equal(log.options.showLevel, true)
      assert.equal(log.options.filename, null)
      assert.equal(log.options.appendFile, true)
      done()
    })
  })

  describe('_write', () => {
    it('logs according to global log level: DEBUG', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      log.debug("hi")
      console.log = old
      assert.equal(out, '[DEBUG] test1: hi')
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      done()
    })

    it('logs according to global log level: INFO', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.INFO)
      log.debug("hi")
      log.info("hi2")
      console.log = old
      assert.equal(out, '[INFO]  test1: hi2')
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      done()
    })

    it('logs according to global log level: WARN', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.WARN)
      log.debug("hi")
      log.info("hi2")
      log.warn("hi3")
      console.log = old
      assert.equal(out, '[WARN]  test1: hi3')
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      done()
    })

    it('logs according to global log level: ERROR', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.ERROR)
      log.debug("hi")
      log.info("hi2")
      log.warn("hi3")
      log.error("hi4")
      console.log = old
      assert.equal(out, '[ERROR] test1: hi4')
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      done()
    })

    it('logs according to global log level: NONE', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.NONE)
      log.debug("hi")
      log.info("hi2")
      log.warn("hi3")
      log.error("hi4")
      console.log = old
      assert.equal(out, '')
      Logger.setLogLevel(Logger.LogLevels.DEBUG)
      done()
    })

    it('writes timestamp in iso time', (done) => {
      let out = ''
      let old = console.log
      // ignore seconds when comparing times
      let isoTime = new Date().toISOString().slice(0, 19)
      console.log = (d) => out += d
      const log = Logger.create('test1')
      log.debug("hi")
      console.log = old
      assert.equal(out.split(" ").length, 4)
      assert.equal(out.split(" ")[3], 'hi')
      let loggedTime = out.split(" ")[0].replace('\u001b[37m', '').slice(0, 19)
      assert.equal(isoTime, loggedTime)
      done()
    })

    it('writes timestamp in local time', (done) => {
      let out = ''
      let old = console.log
      let localTime = new Date().toLocaleString()
      console.log = (d) => out += d
      const log = Logger.create('test1', {useLocalTime: true})
      log.debug("hi")
      console.log = old
      let logArray = out.split(" ")
      assert.equal(logArray[logArray.length - 1], 'hi')
      let loggedTime = logArray.slice(0, logArray.length - 3).join(' ').replace('\u001b[37m', '')
      assert.equal(localTime, loggedTime)
      done()
    })

    it('doesn\'t write timestamp', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false })
      log.debug("hi")
      console.log = old
      assert.equal(out.split(" ").length, 3)
      assert.equal(out.split(" ")[2], 'hi')
      done()
    })

    it('writes log level', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { useColors: false })
      log.debug("hi")
      console.log = old
      assert.equal(out.split(" ").length, 4)
      assert.equal(out.split(" ")[1], '[DEBUG]')
      done()
    })

    it('doesn\'t write log level', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showLevel: false, useColors: false })
      log.debug("hi")
      console.log = old
      assert.equal(out.split(" ").length, 3)
      assert.notEqual(out.split(" ")[1], '[DEBUG]')
      done()
    })

    it('uses colors in terminal', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { useColors: true, showTimestamp: false })
      log.debug("hi")
      console.log = old
      assert.equal(out, '\u001b[36;22m[DEBUG] \u001b[39;1mtest1\u001b[0m: hi')
      done()
    })

    it('uses colors in browser', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      Logger.forceBrowserMode(true)
      const log = Logger.create('test1', { useColors: true, showTimestamp: false })
      log.debug("hi")
      console.log = old
      assert.equal(out, '%c[DEBUG] %ctest1: %chi')
      Logger.forceBrowserMode(false)
      done()
    })

    it('doesn\'t use colors in terminal', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { useColors: false, showTimestamp: false })
      log.debug("hi")
      console.log = old
      assert.equal(out, '[DEBUG] test1: hi')
      done()
    })

    it('doesn\'t use colors in browser', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      Logger.forceBrowserMode(true)
      const log = Logger.create('test1', { useColors: false, showTimestamp: false })
      log.debug("hi")
      console.log = old
      assert.equal(out, '[DEBUG] test1: hi')
      Logger.forceBrowserMode(false)
      done()
    })

    it('sets the logger name', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1234', { useColors: false })
      log.debug("hi")
      console.log = old
      assert.equal(out.split(" ").length, 4)
      assert.equal(out.split(" ")[2], 'test1234:')
      done()
    })

    it('formats strings using %d, %s', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1234', { useColors: false })
      log.debug('hi %d %s', 314, 'THISISASTRING')
      console.log = old
      let result = out.split(' ').slice(3).join(' ')
      assert.equal(result, 'hi 314 THISISASTRING')
      done()
    })
  })

  describe('_write', () => {
    it('creates a log file', (done) => {
      const log = Logger.create('test1', { filename: logfile, appendFile: false, showTimestamp: false })
      assert(!fs.existsSync(logfile))
      log.debug('hello')
      assert(fs.existsSync(logfile))
      done()
    })

    it('writes to a log file', (done) => {
      const log = Logger.create('test1', { filename: logfile, appendFile: false, showTimestamp: false })
      assert(!fs.existsSync(logfile))
      log.debug('hello')
      assert(fs.existsSync(logfile))
      const f = fs.readFileSync(logfile, 'utf-8')
      assert.equal(f, '[DEBUG] test1: hello\n')
      done()
    })

    it('appends to a log file', (done) => {
      const log = Logger.create('test1', { filename: logfile, appendFile: true, showTimestamp: false })
      assert(!fs.existsSync(logfile))
      log.debug('hello')
      log.debug('hello2')
      assert(fs.existsSync(logfile))
      const f = fs.readFileSync(logfile, 'utf-8')
      assert.equal(f, '[DEBUG] test1: hello\n[DEBUG] test1: hello2\n')
      done()
    })

    it('writes to a global log file', (done) => {
      const log1 = Logger.create('test1', { showTimestamp: false })
      const log2 = Logger.create('test2', { showTimestamp: false })
      Logger.setLogfile(logfile)
      log1.debug('hello1')
      log2.debug('hello2')
      assert(fs.existsSync(logfile))
      const f = fs.readFileSync(logfile, 'utf-8')
      assert.equal(f, '[DEBUG] test1: hello1\n[DEBUG] test2: hello2\n')
      done()
    })

  })

  describe('LOG environment variable', () => {
    it('logs according to LOG environment variable', (done) => {
      let out = ''
      let old = console.log
      console.log = (d) => out += d
      const log = Logger.create('test1', { showTimestamp: false, useColors: false })
      Logger.setLogLevel(Logger.LogLevels.NONE)
      process.env.LOG = 'debug'
      log.warn("hi")
      console.log = old
      assert.equal(out, '[WARN]  test1: hi')
      delete process.env.LOG
      done()
    })
  })

  describe('emits events', () => {
    const log = Logger.create('test1', { showTimestamp: false, useColors: false })

    it('emits \'data\'', (done) => {
      Logger.setLogLevel(Logger.LogLevels.WARN)
      Logger.events.on('data', (source, level, text) => {
        assert.equal(source, 'test1')
        assert.equal(level, 'WARN')
        assert.equal(text, 'hi')
        Logger.events.removeAllListeners('data')
        done()
      })
      log.warn("hi")
    })

    it('doesn\'t emit \'data\' when below log level', (done) => {
      Logger.setLogLevel(Logger.LogLevels.NONE)
      Logger.events.on('data', (source, level, text) => {
        console.log(source)
        assert.equal('Should not fire data event', null)
      })
      log.warn("hi")
      setTimeout(() => {
        Logger.events.removeAllListeners('data')
        done()
      }, 100)
    })
  })

})
