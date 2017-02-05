# remote-code [![Build Status](https://travis-ci.org/anoff/remote-code.svg?branch=master)](https://travis-ci.org/anoff/remote-code) [![Coverage Status](https://coveralls.io/repos/github/anoff/remote-code/badge.svg?branch=master)](https://coveralls.io/github/anoff/remote-code?branch=master)

> live-reload for ssh connected devices 🐪 ⌨️️️️️

_What is remote-code?_
`remote-code` is a developer tool that helps you to write code on your normal developer machine but actually run on a remote device (e.g. raspberry pi). It automagically syncs your local files with the remote, runs `npm install` on the device if you update your `package.json` and makes sure the remote process keeps running while you develop using nodemon.

_Why would I need that?_
You may need it depending on your project and how you want to develop; my need for a tool like this emerged from projects supposed to run on a raspberry pi that heavily relies on using pi specific hardware like bluetooth, IO ports etc.
The alternative to remote coding would be to develop on the pi directly. That means either replicating your dev setup onto the machine or working with less familiar tools.

## Install

```
$ npm install --save remote-code
```

### supported platforms

`remote-code` relies heavily on other node modules to achieve the functionality, while they claim to support all major operating systems there currently is no test suite for this. Feel free to contribute 🐳

It has been tested for the following combinations of host/client

| host | client |
|------|--------|
| MacBook Pro | raspbian |

## Usage


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
