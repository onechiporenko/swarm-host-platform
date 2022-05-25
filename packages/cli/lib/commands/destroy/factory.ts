import { Argv } from 'yargs';
import { prompt } from 'inquirer';
import { FactoryInstance } from '../../models/instances/factory';
import { DestroyFactory } from '../../models/commands/destroy/factory';

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
    'Destroy factory `app/factories/some/path/unit`'
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
      new FactoryInstance(
        argv.path,
        argv,
        new DestroyFactory()
      ).command.execute();
    }
  });
};
