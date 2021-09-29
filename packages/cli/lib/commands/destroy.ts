import { Argv } from 'yargs';

exports.command = 'destroy <command>';
exports.aliases = ['d'];
exports.desc = 'destroy some instance';
exports.builder = (yargs: Argv) => yargs.commandDir('destroy');
