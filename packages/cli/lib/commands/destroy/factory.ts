import { Argv } from 'yargs';
import { prompt } from 'inquirer';
import { Destroy } from '../../models/commands/destroy';
import { Factory } from '../../models/instances/factory';

const question = {
  choices: ['n', 'y'],
  message: 'Are you sure?',
  name: 'confirmDestroy',
  type: 'confirm',
};

exports.command = 'factory <path>';
exports.describe = 'destroy existing factory';
exports.builder = (yargs: Argv) => {
  yargs.example(
    '`swarm-host d factory some/path/unit`',
    'Destroy factory `factories/some/path/unit`'
  );
  yargs.options({
    path: {
      describe: 'path to factory',
    },
  });
};
exports.handler = (argv) => {
  prompt([question]).then((answer) => {
    if (answer.confirmDestroy) {
      new Factory(argv.path, argv, new Destroy()).command.execute();
    }
  });
};
