#!/usr/bin/env node

import * as yargs from 'yargs';
// eslint-disable-next-line no-unused-expressions
yargs.wrap(yargs.terminalWidth()).commandDir('commands').demandCommand().help()
  .argv;
