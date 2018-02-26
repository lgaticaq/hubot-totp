'use strict'

const { describe, it, beforeEach, afterEach } = require('mocha')
const Helper = require('hubot-test-helper')
const { expect } = require('chai')

const helper = new Helper('../src/index.js')

describe('hubot-totp', function () {
  const RESPONSE = new RegExp(`\
^secret:\\s\\w{16}\\nhex:\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\
\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2}\\n\
qr:\\shttps:\\/\\/chart\\.googleapis\\.com\\/chart\\?\
chs=200x200&chld=M%7C0&cht=qr&chl=otpauth:\\/\\/totp\\/\\w+\\?secret=\\w{16}$\
`)

  beforeEach(() => {
    this.room = helper.createRoom()
  })

  afterEach(() => this.room.destroy())

  describe('new without encryption', () => {
    beforeEach(done => {
      this.room.user.say('user', 'hubot totp new test')
      setTimeout(done, 100)
    })

    it('should reply full response', () => {
      expect(this.room.messages[1][1]).to.match(RESPONSE)
      expect(this.room.robot.brain.data._private['totp:test']).to.match(
        /\w{16}/
      )
    })
  })

  describe('new with encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3'
      this.room.user.say('user', 'hubot totp new test')
      setTimeout(done, 100)
    })

    it('should reply full response', () => {
      expect(this.room.messages[1][1]).to.match(RESPONSE)
      const secret = this.room.robot.brain.data._private['totp:test']
      expect(secret).to.match(/[\w\W]{64,}/)
    })
  })

  describe('new with error encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPw'
      this.room.user.say('user', 'hubot totp new test')
      setTimeout(done, 100)
    })

    it('should reply full response', () => {
      expect(this.room.messages[1][1]).to.match(RESPONSE)
      expect(this.room.robot.brain.data._private['totp:test']).to.match(
        /\w{16}/
      )
    })
  })

  describe('qr no exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.user.say('user', 'hubot totp qr test')
      setTimeout(done, 100)
    })

    it('should reply warning', () => {
      expect(this.room.messages[1][1]).to.eql('totp with name *test* not exist')
    })
  })

  describe('qr exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.robot.brain.data._private['totp:test'] = 'RW5EOXGGG5YJSOGD'
      this.room.user.say('user', 'hubot totp qr test')
      setTimeout(done, 100)
    })

    it('should reply qr link', () => {
      const QR = new RegExp(`\
^https:\\/\\/chart\\.googleapis\\.com\\/chart\\?\
chs=200x200&chld=M%7C0&cht=qr&chl=otpauth:\\/\\/totp\\/\\w+\\?secret=\\w{16}$\
`)
      expect(this.room.messages[1][1]).to.match(QR)
    })
  })

  describe('hex without encryption', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.user.say('user', 'hubot totp hex test')
      setTimeout(done, 100)
    })

    it('should reply warning', () => {
      expect(this.room.messages[1][1]).to.eql('totp with name *test* not exist')
    })
  })

  describe('hex with encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3'
      this.room.robot.brain.data._private['totp:test'] =
        '668ea36df29592dc3d18637' +
        '80fb956ab620bedc90e9898ca17e0d7a5f76bc37e7a5463c131aeaa13588f34b4a6' +
        'fc7e6a7ogAvR2lWX0ZWHn9mU/8T9hUYnAUSu3BHFHq9nSXXLY='
      this.room.user.say('user', 'hubot totp hex test')
      setTimeout(done, 100)
    })

    it('should reply hex', () => {
      const HEX = new RegExp(`\
^0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\
\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2}$\
`)
      expect(this.room.messages[1][1]).to.match(HEX)
    })
  })

  describe('hex with error encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPw'
      this.room.robot.brain.data._private['totp:test'] = 'RW5EOXGGG5YJSOGD'
      this.room.user.say('user', 'hubot totp hex test')
      setTimeout(done, 100)
    })

    it('should reply hex', () => {
      const HEX = new RegExp(`\
^0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\
\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2},\\s0x\\w{2}$\
`)
      expect(this.room.messages[1][1]).to.match(HEX)
    })
  })

  describe('insert without encryption', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.user.say('user', 'hubot totp insert test RW5EOXGGG5YJSOGD')
      setTimeout(done, 100)
    })

    it('should reply ok', () => {
      expect(this.room.messages[1][1]).to.eql('totp saved :ok_hand:')
      expect(this.room.robot.brain.data._private['totp:test']).to.match(
        /\w{16}/
      )
    })
  })

  describe('insert with encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3'
      this.room.user.say('user', 'hubot totp insert test RW5EOXGGG5YJSOGD')
      setTimeout(done, 100)
    })

    it('should reply ok', () => {
      expect(this.room.messages[1][1]).to.eql('totp saved :ok_hand:')
      const secret = this.room.robot.brain.data._private['totp:test']
      expect(secret).to.match(/[\w\W]{64,}/)
    })
  })

  describe('insert with error encryption', () => {
    beforeEach(done => {
      process.env.TOTP_SECRET = 'nwYy2ChkMX5FPw'
      this.room.user.say('user', 'hubot totp insert test RW5EOXGGG5YJSOGD')
      setTimeout(done, 100)
    })

    it('should reply ok', () => {
      expect(this.room.messages[1][1]).to.eql('totp saved :ok_hand:')
      expect(this.room.robot.brain.data._private['totp:test']).to.match(
        /\w{16}/
      )
    })
  })

  describe('secret no exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.user.say('user', 'hubot totp secret test')
      setTimeout(done, 100)
    })

    it('should reply warning', () => {
      expect(this.room.messages[1][1]).to.eql('totp with name *test* not exist')
    })
  })

  describe('secret exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.robot.brain.data._private['totp:test'] = 'RW5EOXGGG5YJSOGD'
      this.room.user.say('user', 'hubot totp secret test')
      setTimeout(done, 100)
    })

    it('should reply secret link', () => {
      expect(this.room.messages[1][1]).to.match(/\w{16}/)
    })
  })

  describe('totp no exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.user.say('user', 'hubot totp get test')
      setTimeout(done, 100)
    })

    it('should reply warning', () => {
      expect(this.room.messages[1][1]).to.eql('totp with name *test* not exist')
    })
  })

  describe('totp exist', () => {
    beforeEach(done => {
      delete process.env.TOTP_SECRET
      this.room.robot.brain.data._private['totp:test'] = 'RW5EOXGGG5YJSOGD'
      this.room.user.say('user', 'hubot totp get test')
      setTimeout(done, 100)
    })

    it('should reply totp', () => {
      expect(this.room.messages[1][1]).to.match(RESPONSE)
    })
  })
})
