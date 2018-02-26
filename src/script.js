// Description:
//   Obtiene un codigo totp random
//
// Dependencies:
//   thirty-two
//   simple-encryptor
//
// Configuration:
//   TOTP_SECRET
//
// Commands:
//   hubot totp new <name> -> Generate a new totp secret
//   hubot totp qr <name> -> Get qr image of totp secret
//   hubot totp hex <name> -> Convert totp secret to hex
//   hubot totp insert <name> <secret> -> Insert a totp secret
//   hubot totp secret <name> -> Get totp secret
//   hubot totp get <name> -> Get totp secret, hex and qr
//
// Author:
//   lgaticaq

'use strict'

const base32 = require('thirty-two')
const simpleEncryptor = require('simple-encryptor')

module.exports = robot => {
  let warning
  const range = (start = 0, end = 0, step = 1) => {
    return Array((end - start) / step)
      .fill(0)
      .map((v, i) => start + i * step)
  }

  const getHex = secret => {
    const hex = base32
      .decode(secret)
      .toString('hex')
      .toUpperCase()
    return range(0, 20, 2)
      .map(x => `0x${hex.substr(x, 2)}`)
      .join(', ')
  }

  const getQr = (name, secret) => {
    const uri = `otpauth://totp/${name}?secret=${secret}`
    const params = `chs=200x200&chld=M%7C0&cht=qr&chl=${uri}`
    return `https://chart.googleapis.com/chart?${params}`
  }

  const getSecret = name => {
    const secret = robot.brain.get(`totp:${name}`)
    if (secret == null) return null
    if (process.env.TOTP_SECRET === null) return secret
    try {
      const encryptor = simpleEncryptor(process.env.TOTP_SECRET)
      return encryptor.decrypt(secret)
    } catch (err) {
      robot.emit('error', err)
      return secret
    }
  }

  if (process.env.TOTP_SECRET == null) {
    warning =
      'The TOTP_SECRET environment variable not set. ' +
      'Your secret totp is not save encrypted'
    robot.logger.warning(warning)
  } else if (process.env.TOTP_SECRET.length < 16) {
    warning =
      'The TOTP_SECRET must be at least 16 characters long. ' +
      'Your secret totp is not save encrypted'
    robot.logger.warning(warning)
  }

  robot.respond(/totp new (\w+)/i, res => {
    const randomBase32 = (length = 16) => {
      const items = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')
      const result = Array(16)
        .fill(0)
        .map(() => items[Math.floor(Math.random() * items.length)])
      return result.join('')
    }
    const name = res.match[1]
    let secret = randomBase32()
    const qr = getQr(name, secret)
    const hex = getHex(secret)
    res.send(`secret: ${secret}\nhex: ${hex}\nqr: ${qr}`)
    if (process.env.TOTP_SECRET !== null) {
      try {
        const encryptor = simpleEncryptor(process.env.TOTP_SECRET)
        secret = encryptor.encrypt(secret)
      } catch (err) {
        robot.emit('error', err)
      }
    }
    robot.brain.set(`totp:${name}`, secret)
  })

  robot.respond(/totp qr (\w+)/i, res => {
    const name = res.match[1]
    const secret = getSecret(name)
    if (secret === null) return res.send(`totp with name *${name}* not exist`)
    res.send(getQr(name, secret))
  })

  robot.respond(/totp hex (\w+)/i, res => {
    const name = res.match[1]
    const secret = getSecret(name)
    if (secret == null) return res.send(`totp with name *${name}* not exist`)
    res.send(getHex(secret))
  })

  robot.respond(/totp insert (\w+) (\w{16})/i, res => {
    const name = res.match[1]
    let secret = res.match[2]
    if (process.env.TOTP_SECRET !== null) {
      try {
        const encryptor = simpleEncryptor(process.env.TOTP_SECRET)
        secret = encryptor.encrypt(secret)
      } catch (err) {
        robot.emit('error', err)
      }
    }
    robot.brain.set(`totp:${name}`, secret)
    res.send('totp saved :ok_hand:')
  })

  robot.respond(/totp secret (\w+)/i, res => {
    const name = res.match[1]
    const secret = getSecret(name)
    if (secret === null) return res.send(`totp with name *${name}* not exist`)
    res.send(secret)
  })

  robot.respond(/totp get (\w+)/i, res => {
    const name = res.match[1]
    const secret = getSecret(name)
    if (secret === null) return res.send(`totp with name *${name}* not exist`)
    const qr = getQr(name, secret)
    const hex = getHex(secret)
    res.send(`secret: ${secret}\nhex: ${hex}\nqr: ${qr}`)
  })
}
