# hubot-totp

[![npm version](https://img.shields.io/npm/v/hubot-totp.svg?style=flat-square)](https://www.npmjs.com/package/hubot-totp)
[![npm downloads](https://img.shields.io/npm/dm/hubot-totp.svg?style=flat-square)](https://www.npmjs.com/package/hubot-totp)
[![Build Status](https://img.shields.io/travis/lgaticaq/hubot-totp.svg?style=flat-square)](https://travis-ci.org/lgaticaq/hubot-totp)
[![Coverage Status](https://img.shields.io/coveralls/lgaticaq/hubot-totp/master.svg?style=flat-square)](https://coveralls.io/github/lgaticaq/hubot-totp?branch=master)
[![Code Climate](https://img.shields.io/codeclimate/github/lgaticaq/hubot-totp.svg?style=flat-square)](https://codeclimate.com/github/lgaticaq/hubot-totp)
[![dependency Status](https://img.shields.io/david/lgaticaq/hubot-totp.svg?style=flat-square)](https://david-dm.org/lgaticaq/hubot-totp#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/lgaticaq/hubot-totp.svg?style=flat-square)](https://david-dm.org/lgaticaq/hubot-totp#info=devDependencies)

> A Hubot script to generate and save totp secret encrypted

## Installation
```bash
npm i -S hubot-totp
```

Set environment variable *TOTP_SECRET* to encrypt secret.

add `["hubot-totp"]` to `external-scripts.json`.

## Examples

`hubot totp new <name>` -> `Generate a new totp secret`

`hubot totp qr <name>` -> `Get qr image of totp secret`

`hubot totp hex <name>` -> `Convert totp secret to hex`

`hubot totp insert <name> <secret>` -> `Insert a totp secret`

`hubot totp secret <name>` -> `Get totp secret`

`hubot totp get <name>` -> `Get totp secret, hex and qr`

## License

[MIT](https://tldrlegal.com/license/mit-license)
