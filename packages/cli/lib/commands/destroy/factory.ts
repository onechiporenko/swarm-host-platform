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
  const shell = require('shelljs');
  const path = require('path');
  const p = path.parse(argv.path);
  const factoryName = p.name;
  const factoryDir = path.join(process.cwd(), 'factories', p.dir);
  const factoryFullPath = path.join(factoryDir, `${factoryName}.ts`);
  shell.rm('-rf', factoryFullPath);
};
