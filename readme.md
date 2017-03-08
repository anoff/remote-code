remote-code [![Build Status](https://travis-ci.org/anoff/remote-code.svg?branch=master)](https://travis-ci.org/anoff/remote-code) [![npm](https://img.shields.io/npm/v/remote-code.svg)]()
===

> live-reload for ssh connected devices 🐪

<p align="center">
  <img src="https://github.com/anoff/remote-code/raw/master/logo.png"/>
</p>

_What is remote-code?_
`remote-code` is a developer tool that helps you to write code on your normal developer machine but actually run on a remote device (e.g. raspberry pi). It automagically syncs your local files with the remote, installs dependencies on the device if you update your `package.json` and makes sure the remote process keeps running while you develop using `nodemon`.

_Why would I need that?_
You may need it depending on your project and how you want to develop; my need for a tool like this emerged from projects supposed to run on a raspberry pi that heavily relies on using pi specific hardware like bluetooth, IO ports etc.
The alternative to remote coding would be to develop on the pi directly. That means either replicating your dev setup onto the machine or working with less familiar tools.

<p align="center">
  <img src="https://github.com/anoff/remote-code/raw/master/demo.gif"/>
</p>

# Install

Recommended to use as CLI

```
$ npm i -g remote-code
```

## supported platforms

`remote-code` relies heavily on other node modules to achieve the functionality, while they claim to support all major operating systems there currently is no test suite for this. Feel free to contribute 🐳

It has been tested for the following combinations of host/client

| host | client |
|------|--------|
| MacBook Pro | raspbian |

## prerequisites

At the moment your host needs to fulfill a few requirements for this to work:
* rsync installed
* yarn & nodemon globally available
* remote target needs to have reachable npm upstream to install dependencies (i.e. internet connection)

# Usage

```
$ remote-code help
  live-reload for ssh connected devices 🐪

  Usage
  	$ remote-code <[user@]host>

  	This will happen:
  	✈️	sync local directory content with remote dir
  	📦	run 'yarn' to install dependencies
  	👀	open a ssh stream to view remote output
  	🔃	run 'nodemon .' in the remote directory

  	Note: Without specifying --source and/or --target default dirs will be used. You should only do this for testing as the directory could be dirty from previous runs.


  Options
  	--port, -p		Custom port [22]
  	--identity-file, -i	SSH keyfile
  	--user, -u		SSH username
  	--password, -P		SSH password (not supported)
  	--source, -s 		directory to synchronize (local) [CWD]
  	--target, -t 		remote location to sync to [~/remote-sync]
  	--verbose, -v 		log all the things

  Examples
  	$ remote-code user@192.168.0.4
  	$ remote-code -p 23 -i ~/.ssh/id_rsa --user admin 192.168.0.4
  	$ remote-code -i ~/.ssh/id_rsa pi@192.168.0.4 --source ~/myProject --target ~/myProjec
```

## Todo
* [ ] ship with `setup` routine to install `yarn` & `nodemon` if they are missing on remote
* [ ] test if this works with virtual machines as a target (e.g. EC2)
* [ ] test password authentication
* [ ] move options logic to index to allow testing for defaults

If you find anything that you don't like **create an issue**.

# License

MIT © [anoff](http://anoff.io)

## Credits

Kudos to the libraries I didn't have to worry about because someone else did:
* [chokidar](https://github.com/paulmillr/chokidar): watch files on local system
* [rsync](https://github.com/mattijs/node-rsync): copy code from local to remote
* [nodemon](https://github.com/remy/nodemon): keep node process on remote running
* [ssh2](https://github.com/mscdex/ssh2): start remote processes like `nodemon` and `npm/yarn install`
