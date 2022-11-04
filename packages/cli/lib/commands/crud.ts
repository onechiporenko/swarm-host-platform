import { Argv } from 'yargs';

exports.command = 'crud <action>';
exports.desc = 'Does a common CRUD-request';
exports.builder = (yargs: Argv) => {
  yargs.commandDir('crud');
  yargs.options({
    host: {
      describe: 'Custom hostname',
      default: 'http://localhost',
    },
    port: {
      describe: 'Custom port',
      default: 54321,
    },
  });
};
