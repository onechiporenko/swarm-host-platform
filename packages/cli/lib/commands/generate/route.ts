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
  const shell = require('shelljs');
  const path = require('path');
  const fs = require('fs');
  const ejs = require('ejs');
  const tpl = fs.readFileSync(path.join(__dirname, '../../../blueprints/files/route.ejs'), 'utf-8');
  const p = path.parse(argv.path);
  if (!argv.url) {
    argv.url = path.join(p.dir, p.name);
  }
  const routeDir = path.join(process.cwd(), 'routes', p.dir);
  const routeFullPath = path.join(routeDir, `${p.name}.ts`);
  shell.mkdir('-p', routeDir);
  shell.echo(ejs.render(tpl, argv)).to(routeFullPath);
};
