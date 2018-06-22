import {GenerateFactory} from '../../models/commands/generate/factory';
import {Factory} from '../../models/instances/factory';

exports.command = 'factory <path> [rest..]';
exports.describe = 'generates new factory';
exports.builder = yargs => {
  yargs.example('`swarm-host g factory some/path/unit`', 'Create an empty Factory `factories/some/path/unit`');
  yargs.example('`swarm-host g factory some/path/unit name:string squad:has-one:squad`', 'Create a Factory `factories/some/path/unit` with two fields `name` and `squad`');
  yargs.options({
    path: {
      describe: 'path to factory'
    },
    rest: {
      describe: 'list of attributes for factory'
    }
  });
};
exports.handler = argv => {
  new Factory(argv.path, argv, new GenerateFactory()).command.execute();
};
