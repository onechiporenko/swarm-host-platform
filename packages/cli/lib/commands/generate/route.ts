import { Argv } from 'yargs';
import { GenerateRoute } from '../../models/commands/generate/route';
import { RouteInstance } from '../../models/instances/route';

exports.command = 'route <path>';
exports.describe = 'generates new route';
exports.builder = (yargs: Argv) => {
  yargs.example(
    '`swarm-host g route some/path/units`',
    'Create a Route `app/routes/some/path/units` to handle GET-request to `/some/path/units`'
  );
  yargs.example(
    '`swarm-host g route some/path/units/create --method=post --url=units/create`',
    'Create a Route `app/routes/some/path/units/create` to handle POST-request to `/units/create`'
  );
  yargs.options({
    method: {
      default: 'get',
      describe: 'Request method (get, post etc)',
      type: 'string',
    },
    url: {
      describe: '`path` is used if `url` is not provided',
      type: 'string',
    },
    syntax: {
      describe:
        'Determines how new route will be created - subclass of Route or Route\'s instance ("class" or "default")',
      default: 'default',
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
    'parent-model': {
      type: 'string',
    },
  });
};
exports.handler = (argv) => {
  new RouteInstance(argv.path, argv, new GenerateRoute()).command.execute();
};
