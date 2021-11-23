import { Argv } from 'yargs';
import { cp, exec, echo, ls } from 'shelljs';
import { render } from 'ejs';
import * as path from 'path';
import * as fs from 'fs';

exports.command = 'init';
exports.desc = 'initialize swarm-host project in the empty directory';
exports.builder = (yargs: Argv) => {
  yargs.example(
    '`swarm-host init`',
    'Initialize new Swarm-Host in the current dir'
  );
  yargs.options({
    'skip-npm': {
      describe: 'Do not install npm packages',
    },
  });
};
exports.handler = (argv) => {
  const dirContent = ls('-A', process.cwd());
  if (dirContent.length !== 0) {
    console.log('`init` can be executed only in the empty dir');
    process.exit(1);
  }
  const p = path.parse(process.cwd());
  const projectName = p.name;
  const projectTplPath = path.join(__dirname, '../../blueprints/project/');
  const packageJson = fs.readFileSync(
    path.join(projectTplPath, 'package.json'),
    'utf-8'
  );
  cp('-r', path.join(projectTplPath, '/*'), '.');
  // cp skipping dot files - https://github.com/shelljs/shelljs/issues/79
  cp(path.join(projectTplPath, '/.eslintrc.json'), '.');
  cp(path.join(projectTplPath, '/.prettierrc.js'), '.');
  echo(
    render(packageJson, {
      name: projectName,
    })
  ).to('package.json');
  if (!argv.skipNpm) {
    console.log('Installing npm dependencies...');
    exec('npm i --save swarm-host');
    exec(
      'npm i --save-dev @types/node ts-node typescript eslint eslint-config-prettier eslint-plugin-prettier prettier'
    );
    exec('npm run lint');
  }
};
