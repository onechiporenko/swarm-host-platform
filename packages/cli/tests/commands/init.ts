import { getTmpDir, init } from '../utils/utils';
import {expect} from 'chai';
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
    const dirContent = ls('-A', '.');
    expect(dirContent).to.include('factories');
    expect(dirContent).to.include('routes');
    expect(dirContent).to.include('package.json');
    expect(dirContent).to.include('index.ts');
    expect(dirContent).to.include('server.ts');
    expect(dirContent).to.include('tsconfig.json');
    expect(dirContent).to.include('tslint.json');
  });

});
