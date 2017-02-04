#!/usr/bin/env node
'use strict';
const meow = require('meow');
const remoteCode = require('.');

const cli = meow(`
	Usage
	  $ remote-code [input]

	Options
	  --foo  Lorem ipsum [Default: false]

	Examples
	  $ remote-code
	  unicorns & rainbows
	  $ remote-code ponies
	  ponies & rainbows
`);

console.log(remoteCode(cli.input[0] || 'unicorns'));
