import { Argv } from 'yargs';
import { prompt } from 'inquirer';
import { Destroy } from '../../models/commands/destroy';
import { Route } from '../../models/instances/route';

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
    'Destroy route `routes/some/path/units`'
  );
  yargs.options({
    path: {
      describe: 'path to route',
    },
  });
};
exports.handler = (argv) => {
  prompt([question]).then((answer) => {
    if (answer.confirmDestroy) {
      new Route(argv.path, argv, new Destroy()).command.execute();
    }
  });
};
