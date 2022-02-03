import { Argv } from 'yargs';
import { GenerateFactory } from '../../models/commands/generate/factory';
import { Factory } from '../../models/instances/factory';

exports.command = 'factory <path> [rest..]';
exports.describe = 'generates new factory';
exports.builder = (yargs: Argv) => {
  yargs.example(
    '`swarm-host g factory some/path/unit`',
    'Create an empty Factory `app/factories/some/path/unit`'
  );
  yargs.example(
    '`swarm-host g factory some/path/unit name:string squad:has-one:squad`',
    'Create a Factory `app/factories/some/path/unit` with two fields `name` and `squad`'
  );
  yargs.example(
    '`swarm-host g factory child --extends=parent`',
    'Create an empty Factory `app/factories/child` extends `app/factories/parent`'
  );
  yargs.options({
    path: {
      describe: 'path to factory',
    },
    extends: {
      describe: 'User defined factory to use as a parent class',
    },
  });
};
exports.handler = (argv) => {
  new Factory(argv.path, argv, new GenerateFactory()).command.execute();
};
