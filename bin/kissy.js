#!/usr/bin/env node

/*
  command management
  @author yiminghe@gmail.com
 */
var program = require('commander');

program
    .version(require('../package.json').version)
    .command('xtemplate <cmd>', 'run xtemplate')
    .parse(process.argv);

if (process.argv.length < 3) {
    program.outputHelp();
    process.exit(1);
}