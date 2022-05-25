import { Argv } from 'yargs';
import { prompt } from 'inquirer';
import { RouteInstance } from '../../models/instances/route';
import { DestroyRoute } from '../../models/commands/destroy/route';

const question = {
  choices: ['n', 'y'],
  message: 'Are you sure?',
  name: 'confirmDestroy',
  type: 'confirm',
};

exports.command = 'route <path>';
exports.describe = 'destroy existing route';
exports.builder = (yargs: Argv) => {
  yargs.example(
    '`swarm-host d route some/path/units`',
    'Destroy route `app/routes/some/path/units`'
  );
  yargs.options({
    path: {
      describe: 'path to route',
    },
    'skip-source': {
      type: 'boolean',
      description: 'Do not create a source file for route',
      default: false,
    },
    'skip-test': {
      type: 'boolean',
      description: 'Do not create a test and schema files for route',
      default: false,
    },
  });
};
exports.handler = (argv) => {
  prompt([question]).then((answer) => {
    if (answer.confirmDestroy) {
      new RouteInstance(argv.path, argv, new DestroyRoute()).command.execute();
    }
  });
};
