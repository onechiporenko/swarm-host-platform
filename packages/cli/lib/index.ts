#!/usr/bin/env node

import yargs = require('yargs');
// tslint:disable-next-line:no-unused-expression
yargs
  .wrap(yargs.terminalWidth())
  .commandDir('commands')
  .demandCommand()
  .help()
  .argv;
