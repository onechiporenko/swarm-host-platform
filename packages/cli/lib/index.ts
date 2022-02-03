#!/usr/bin/env node
/* eslint-disable mocha-cleanup/no-assertions-outside-it */

import * as yargs from 'yargs';
import { assert } from './assert';
// eslint-disable-next-line no-unused-expressions
yargs
  .wrap(yargs.terminalWidth())
  .commandDir('commands')
  .demandCommand()
  .help()
  .check((argv) => {
    if (argv.path) {
      assert(
        `Path should not contain "..". You passed "${argv.path}"`,
        !`${argv.path}`.includes('..')
      );
    }
    return true;
  }).argv;
