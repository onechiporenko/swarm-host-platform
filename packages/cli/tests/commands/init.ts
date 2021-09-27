import {getTmpDir} from '../utils/utils';
import {expect} from 'chai';
import execa = require('execa');
import shell = require('shelljs');

let tmpDir;

describe('Init Project', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
  });

  afterEach(() => shell.rm('-rf', tmpDir));

  it('should create initial files', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js init --skip-npm`)
      .then(() => {
        const dirContent = shell.ls('-A', tmpDir);
        expect(dirContent).to.include('factories');
        expect(dirContent).to.include('routes');
        expect(dirContent).to.include('package.json');
        expect(dirContent).to.include('index.ts');
        expect(dirContent).to.include('server.ts');
        expect(dirContent).to.include('tsconfig.json');
        expect(dirContent).to.include('tslint.json');
        done();
      });
  });

});
