exports.command = 'init';
exports.desc = 'initialize swarm-host project in the empty directory';
exports.builder = yargs => {
  yargs.example('`swarm-host init`', 'Initialize new Swarm-Host in the current dir');
  yargs.options({
    'skip-npm': {
      describe: 'Do not install npm packages'
    }
  });
};
exports.handler = argv => {
  const shell = require('shelljs');
  const path = require('path');
  const fs = require('fs');
  const ejs = require('ejs');
  const dirContent = shell.ls('-A', process.cwd());
  if (dirContent.length !== 0) {
    console.log('`init` can be executed only in the empty dir');
    process.exit(1);
  }
  shell.mkdir('routes');
  shell.mkdir('factories');
  const p = path.parse(process.cwd());
  const projectName = p.name;
  const projectTplPath = path.join(__dirname, '../../blueprints/project/');
  const packageJson = fs.readFileSync(path.join(projectTplPath, 'package.json'), 'utf-8');
  shell.cp(path.join(projectTplPath, '/*'), '.');
  shell.echo(ejs.render(packageJson, {
    name: projectName
  })).to('package.json');
  if (!argv.skipNpm) {
    console.log('Installing npm dependencies...');
    shell.exec('npm i --save swarm-host typescript');
    shell.exec('npm i --save-dev @types/node ts-node tslint');
  }
};
