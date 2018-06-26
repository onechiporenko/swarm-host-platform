import {getTmpDir} from '../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

describe('Init Project', () => {

  beforeEach(() => {
    this.tmpDir = getTmpDir();
    shell.mkdir(this.tmpDir);
  });

  afterEach(() => shell.rm('-rf', this.tmpDir));

  it('should create initial files', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js init --skip-npm`)
      .then(() => {
        const dirContent = shell.ls('-A', this.tmpDir);
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
