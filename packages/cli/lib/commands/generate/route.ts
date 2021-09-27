import { GenerateRoute } from '../../models/commands/generate/route';
import { Route } from '../../models/instances/route';

exports.command = 'route <path>';
exports.describe = 'generates new route';
exports.builder = yargs => {
  yargs.example('`swarm-host g route some/path/units`', 'Create a Route `routes/some/path/units` to handle GET-request to `/some/path/units`');
  yargs.example('`swarm-host g route some/path/units/create --method=post --url=units/create`', 'Create a Route `routes/some/path/units/create` to handle POST-request to `/units/create`');
  yargs.options({
    method: {
      default: 'get',
      describe: 'Request method (get, post etc)',
      type: 'string'
    },
    url: {
      describe: '`path` is used if `url` is not provided',
      type: 'string'
    }
  });
};
exports.handler = argv => {
  new Route(argv.path, argv, new GenerateRoute()).command.execute();
};
