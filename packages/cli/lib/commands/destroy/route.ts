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
  const shell = require('shelljs');
  const path = require('path');
  const p = path.parse(argv.path);
  const routeDir = path.join(process.cwd(), 'routes', p.dir);
  const routeFullPath = path.join(routeDir, `${p.name}.ts`);
  shell.rm('-rf', routeFullPath);
};
