import { Destroy } from '../../models/commands/destroy';
import { Factory } from '../../models/instances/factory';

exports.command = 'factory <path>';
exports.describe = 'destroy existing factory';
exports.builder = yargs => {
  yargs.example('`swarm-host d factory some/path/unit`', 'Destroy factory `factories/some/path/unit`');
  yargs.options({
    path: {
      describe: 'path to factory'
    }
  });
};
exports.handler = argv => {
  require('inquirer').createPromptModule()({
    choices: ['n', 'y'],
    message: 'Are you sure?',
    name: 'confirmDestroy',
    type: 'confirm'
  }).then(({confirmDestroy}) => {
    if (confirmDestroy) {
      new Factory(argv.path, argv, new Destroy()).command.execute();
    }
  });
};
