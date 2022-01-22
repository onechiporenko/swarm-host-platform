import { Argv } from 'yargs';

exports.command = 'generate <command>';
exports.aliases = ['g'];
exports.desc = 'generate some instance';
exports.builder = (yargs: Argv) => yargs.commandDir('generate');
