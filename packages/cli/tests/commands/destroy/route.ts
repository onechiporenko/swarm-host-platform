import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

describe('Destroy Route', () => {
  beforeEach(() => {
    this.tmpDir = getTmpDir();
    shell.mkdir(this.tmpDir);
  });

  afterEach(() => shell.rm('-rf', this.tmpDir));

  it('should delete existing route', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate route units`)
      .then(() => {
        expect(shell.cat(`${this.tmpDir}/routes/units.ts`).stdout).to.be.not.empty;
        execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js destroy route units`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${this.tmpDir}/routes/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should delete existing nested route', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate route all/units`)
      .then(() => {
        expect(shell.cat(`${this.tmpDir}/routes/all/units.ts`).stdout).to.be.not.empty;
        execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js destroy route all/units`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${this.tmpDir}/routes/all/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });
});
