#!/usr/bin/env node

const cmd = require('commander');
const FactorAnalysis = require('../src/factorAnalysis');
const version = require('../package.json').version;

cmd.version(version);

cmd.command('parse [input]').action(bundle);

cmd.command('help [command]').action(function(command) {
  let subcmd = cmd.commands.find(c => c.name() === command) || cmd;
  subcmd.help();
});

var args = process.argv;
if (!args[2] || !cmd.commands.some(c => c.name() === args[2])) {
  args.splice(2, 0, 'help');
}

cmd.parse(args);

function bundle(main, command) {
  console.log(command.name());
}
