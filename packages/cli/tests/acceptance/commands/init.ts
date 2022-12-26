import { getTmpDir, init } from '../utils/utils';
import { expect } from 'chai';
import shell = require('shelljs');
import { cd, ls } from 'shelljs';

let tmpDir;

describe('Init Project', () => {
  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
    cd(tmpDir);
  });

  afterEach(() => {
    cd('..');
    shell.rm('-rf', tmpDir);
  });

  it('should create initial files', () => {
    init(['--skip-npm']);
    let dirContent = ls('-A', '.');
    expect(dirContent).to.include('app');
    expect(dirContent).to.include('package.json');
    expect(dirContent).to.include('index.ts');
    expect(dirContent).to.include('tsconfig.json');
    expect(dirContent).to.include('.eslintrc.json');
    expect(dirContent).to.include('.gitignore');
    expect(dirContent).to.include('.prettierrc.js');
    expect(dirContent).to.include('server-setup.ts');
    expect(dirContent).to.include('mocha-global.ts');
    expect(dirContent).to.include('mocha-global-e2e.ts');
    expect(dirContent).to.include('argv.ts');
    dirContent = ls('-A', './app');
    expect(dirContent).to.include('factories');
    expect(dirContent).to.include('routes');
    expect(dirContent).to.include('server.ts');
    dirContent = ls('-A', './app/factories');
    expect(dirContent).to.include('.gitkeep');
    dirContent = ls('-A', './app/routes');
    expect(dirContent).to.include('.gitkeep');
  });
});
