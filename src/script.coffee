# Description:
#   Obtiene un codigo totp random
#
# Dependencies:
#   thirty-two
#   simple-encryptor
#
# Configuration:
#   TOTP_SECRET
#
# Commands:
#   hubot totp new <name> -> Generate a new totp secret
#   hubot totp qr <name> -> Get qr image of totp secret
#   hubot totp hex <name> -> Convert totp secret to hex
#   hubot totp insert <name> <secret> -> Insert a totp secret
#
# Author:
#   lgaticaq

base32 = require("thirty-two")
simpleEncryptor = require("simple-encryptor")

module.exports = (robot) ->
  range = (start=0, end=0, step=1) ->
    return Array((end - start) / step).fill(0).map (v, i) ->
      start + (i * step)

  getHex = (secret) ->
    hex = base32.decode(secret).toString("hex").toUpperCase()
    return range(0, 20, 2).map((x) -> "0x#{hex.substr(x, 2)}").join(", ")

  getQr = (name, secret) ->
    uri = "otpauth://totp/#{name}?secret=#{secret}"
    params = "chs=200x200&chld=M%7C0&cht=qr&chl=#{uri}"
    return "https://chart.googleapis.com/chart?#{params}"

  getSecret = (name) ->
    secret = robot.brain.get("totp:#{name}")
    unless secret?
      return
    unless process.env.TOTP_SECRET?
      return secret
    try
      encryptor = simpleEncryptor(process.env.TOTP_SECRET)
      return encryptor.decrypt(secret)
    catch err
      robot.emit("error", err)
      return secret

  unless process.env.TOTP_SECRET?
    warning = "The TOTP_SECRET environment variable not set. " +
      "Your secret totp is not save encrypted"
    robot.logger.warning(warning)
  else if process.env.TOTP_SECRET.length < 16
    warning = "The TOTP_SECRET must be at least 16 characters long. " +
      "Your secret totp is not save encrypted"
    robot.logger.warning(warning)

  robot.respond /totp new (\w+)/i, (res) ->
    randomBase32 = (length=16) ->
      items = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567")
      result = Array(16).fill(0).map () ->
        items[Math.floor(Math.random()*items.length)]
      return result.join("")
    name = res.match[1]
    secret = randomBase32()
    qr = getQr(name, secret)
    hex = getHex(secret)
    res.send "secret: #{secret}\nhex: #{hex}\nqr: #{qr}"
    if process.env.TOTP_SECRET?
      try
        encryptor = simpleEncryptor(process.env.TOTP_SECRET)
        secret = encryptor.encrypt(secret)
      catch err
        robot.emit("error", err)
    robot.brain.set("totp:#{name}", secret)

  robot.respond /totp qr (\w+)/i, (res) ->
    name = res.match[1]
    secret = getSecret(name)
    unless secret?
      res.send("totp with name *#{name}* not exist")
      return
    res.send(getQr(name, secret))

  robot.respond /totp hex (\w+)/i, (res) ->
    name = res.match[1]
    secret = getSecret(name)
    unless secret?
      res.send("totp with name *#{name}* not exist")
      return
    res.send(getHex(secret))

  robot.respond /totp insert (\w+) (\w{16})/i, (res) ->
    [_, name, secret] = res.match
    if process.env.TOTP_SECRET?
      try
        encryptor = simpleEncryptor(process.env.TOTP_SECRET)
        secret = encryptor.encrypt(secret)
      catch err
        robot.emit("error", err)
    robot.brain.set("totp:#{name}", secret)
    res.send("totp saved :ok_hand:")
