const split = require('split');
const ssh = require('./lib/ssh');
const path = require('path');

const settings = {
	project: '/developer/anoff/'
}
ssh.connect();

// make node process interactive by passing stdin to the remote shell
process.stdin.pipe(split()).on('data', line => {
	ssh.send(line);
});
