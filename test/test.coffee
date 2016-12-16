Helper = require("hubot-test-helper")
expect = require("chai").expect

helper = new Helper("./../src/index.coffee")

describe "hubot-totp", ->
  room = null
  RESPONSE = ///
    ^secret:\s\w{16}\nhex:\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},
    \s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2}\n
    qr:\shttps:\/\/chart\.googleapis\.com\/chart\?
    chs=200x200&chld=M%7C0&cht=qr&chl=otpauth:\/\/totp\/\w+\?secret=\w{16}$
  ///

  beforeEach ->
    room = helper.createRoom()

  afterEach ->
    room.destroy()

  context "new without encryption", ->
    beforeEach (done) ->
      room.user.say("user", "hubot totp new test")
      setTimeout(done, 100)

    it "should reply full response", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.match(RESPONSE)
      expect(room.robot.brain.data._private["totp:test"]).to.match(/\w{16}/)

  context "new with encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3"
      room.user.say("user", "hubot totp new test")
      setTimeout(done, 100)

    it "should reply full response", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.match(RESPONSE)
      secret = room.robot.brain.data._private["totp:test"]
      expect(secret).to.match(/[\w\W]{64,}/)

  context "new with error encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPw"
      room.user.say("user", "hubot totp new test")
      setTimeout(done, 100)

    it "should reply full response", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.match(RESPONSE)
      expect(room.robot.brain.data._private["totp:test"]).to.match(/\w{16}/)

  context "qr no exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.user.say("user", "hubot totp qr test")
      setTimeout(done, 100)

    it "should reply warning", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp with name *test* not exist")

  context "qr exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.robot.brain.data._private["totp:test"] = "RW5EOXGGG5YJSOGD"
      room.user.say("user", "hubot totp qr test")
      setTimeout(done, 100)

    it "should reply qr link", ->
      [[_, _], [_, result]] = room.messages
      QR = ///
        ^https:\/\/chart\.googleapis\.com\/chart\?
        chs=200x200&chld=M%7C0&cht=qr&chl=otpauth:\/\/totp\/\w+\?secret=\w{16}$
      ///
      expect(result).to.match(QR)

  context "hex without encryption", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.user.say("user", "hubot totp hex test")
      setTimeout(done, 100)

    it "should reply warning", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp with name *test* not exist")

  context "hex with encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3"
      room.robot.brain.data._private["totp:test"] = "668ea36df29592dc3d18637" +
        "80fb956ab620bedc90e9898ca17e0d7a5f76bc37e7a5463c131aeaa13588f34b4a6" +
        "fc7e6a7ogAvR2lWX0ZWHn9mU/8T9hUYnAUSu3BHFHq9nSXXLY="
      room.user.say("user", "hubot totp hex test")
      setTimeout(done, 100)

    it "should reply hex", ->
      [[_, _], [_, result]] = room.messages
      HEX = ///
        ^0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},
        \s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2}$
      ///
      expect(result).to.match(HEX)

  context "hex with error encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPw"
      room.robot.brain.data._private["totp:test"] = "RW5EOXGGG5YJSOGD"
      room.user.say("user", "hubot totp hex test")
      setTimeout(done, 100)

    it "should reply hex", ->
      [[_, _], [_, result]] = room.messages
      HEX = ///
        ^0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2},
        \s0x\w{2},\s0x\w{2},\s0x\w{2},\s0x\w{2}$
      ///
      expect(result).to.match(HEX)

  context "insert without encryption", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.user.say("user", "hubot totp insert test RW5EOXGGG5YJSOGD")
      setTimeout(done, 100)

    it "should reply ok", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp saved :ok_hand:")
      expect(room.robot.brain.data._private["totp:test"]).to.match(/\w{16}/)

  context "insert with encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPwHxvzNWR97yrWgMTYz3"
      room.user.say("user", "hubot totp insert test RW5EOXGGG5YJSOGD")
      setTimeout(done, 100)

    it "should reply ok", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp saved :ok_hand:")
      secret = room.robot.brain.data._private["totp:test"]
      expect(secret).to.match(/[\w\W]{64,}/)

  context "insert with error encryption", ->
    beforeEach (done) ->
      process.env.TOTP_SECRET = "nwYy2ChkMX5FPw"
      room.user.say("user", "hubot totp insert test RW5EOXGGG5YJSOGD")
      setTimeout(done, 100)

    it "should reply ok", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp saved :ok_hand:")
      expect(room.robot.brain.data._private["totp:test"]).to.match(/\w{16}/)

  context "secret no exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.user.say("user", "hubot totp secret test")
      setTimeout(done, 100)

    it "should reply warning", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp with name *test* not exist")

  context "secret exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.robot.brain.data._private["totp:test"] = "RW5EOXGGG5YJSOGD"
      room.user.say("user", "hubot totp secret test")
      setTimeout(done, 100)

    it "should reply secret link", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.match(/\w{16}/)

  context "totp no exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.user.say("user", "hubot totp get test")
      setTimeout(done, 100)

    it "should reply warning", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.eql("totp with name *test* not exist")

  context "totp exist", ->
    beforeEach (done) ->
      delete process.env.TOTP_SECRET
      room.robot.brain.data._private["totp:test"] = "RW5EOXGGG5YJSOGD"
      room.user.say("user", "hubot totp get test")
      setTimeout(done, 100)

    it "should reply totp", ->
      [[_, _], [_, result]] = room.messages
      expect(result).to.match(RESPONSE)
