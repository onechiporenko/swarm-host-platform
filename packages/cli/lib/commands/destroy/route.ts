import {Destroy} from '../../models/commands/destroy';
import {Route} from '../../models/instances/route';

exports.command = 'route <path>';
exports.describe = 'destroy existing route';
exports.builder = yargs => {
  yargs.example('`swarm-host d route some/path/units`', 'Destroy route `routes/some/path/units`');
  yargs.options({
    path: {
      describe: 'path to route'
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
      new Route(argv.path, argv, new Destroy()).command.execute();
    }
  });
};
