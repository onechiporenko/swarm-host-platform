import { Argv } from 'yargs';
import { ShellString, cp, exec, ls, test } from 'shelljs';
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
    'package-manager': {
      default: 'npm',
      alias: 'pm',
      describe: 'Package manager to use',
      choices: ['npm', 'yarn', 'pnpm'],
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
  cp(path.join(projectTplPath, '/.gitignore'), '.');
  cp(path.join(projectTplPath, '/.eslintrc.json'), '.');
  cp(path.join(projectTplPath, '/.prettierrc.js'), '.');
  ShellString(
    render(packageJson, {
      name: projectName,
    })
  ).to('package.json');
  if (!argv['skip-npm']) {
    console.log('Installing npm dependencies...');
    switch (argv['package-manager']) {
      case 'npm':
        exec('npm i');
        break;
      case 'yarn':
        exec('yarn');
        break;
      case 'pnpm':
        exec('pnpm i');
        break;
    }
    const linterPath = path.join(process.cwd(), './node_modules/.bin/eslint');
    if (test('-f', linterPath)) {
      exec(`${linterPath} . --fix`, { silent: true });
    }
  }
};
