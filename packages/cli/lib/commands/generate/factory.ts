import FactoryAttr from '../../models/factory-attr';

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
  const shell = require('shelljs');
  const path = require('path');
  const fs = require('fs');
  const ejs = require('ejs');
  const tpl = fs.readFileSync(path.join(__dirname, '../../../blueprints/files/factory.ejs'), 'utf-8');
  const p = path.parse(argv.path);
  const factoryName =  p.name;
  const factoryDir = path.join(process.cwd(), 'factories', p.dir);
  const factoryFullPath = path.join(factoryDir, `${factoryName}.ts`);
  shell.mkdir('-p', factoryDir);
  shell.echo(ejs.render(tpl, {
    attrs: argv.rest.map(attr => new FactoryAttr(attr)).sort((attr1, attr2) => attr1.attrType > attr2.attrType),
    name: factoryName
  })).to(factoryFullPath);
};
