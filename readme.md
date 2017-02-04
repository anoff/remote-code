# remote-code [![Build Status](https://travis-ci.org/anoff/remote-code.svg?branch=master)](https://travis-ci.org/anoff/remote-code) [![Coverage Status](https://coveralls.io/repos/github/anoff/remote-code/badge.svg?branch=master)](https://coveralls.io/github/anoff/remote-code?branch=master)

[![Greenkeeper badge](https://badges.greenkeeper.io/anoff/remote-code.svg)](https://greenkeeper.io/)

> live-reload for ssh connected devices 🐪 ⌨️️️️️


## Install

```
$ npm install --save remote-code
```


## Usage

```js
const remoteCode = require('remote-code');

remoteCode('unicorns');
//=> 'unicorns & rainbows'
```


## API

### remoteCode(input, [options])

#### input

Type: `string`

Lorem ipsum.

#### options

##### foo

Type: `boolean`<br>
Default: `false`

Lorem ipsum.


## CLI

```
$ npm install --global remote-code
```

```
$ remote-code --help

  Usage
    remote-code [input]

  Options
    --foo  Lorem ipsum [Default: false]

  Examples
    $ remote-code
    unicorns & rainbows
    $ remote-code ponies
    ponies & rainbows
```


## License

MIT © [anoff](http://anoff.io)
