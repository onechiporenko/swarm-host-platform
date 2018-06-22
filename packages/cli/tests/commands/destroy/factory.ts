import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

describe('Destroy Factory', () => {
  beforeEach(() => {
    this.tmpDir = getTmpDir();
    shell.mkdir(this.tmpDir);
  });

  afterEach(() => shell.rm('-rf', this.tmpDir));

  it('should delete existing factory', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        expect(shell.cat(`${this.tmpDir}/factories/unit.ts`).stdout).to.be.not.empty;
        execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js destroy factory unit`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${this.tmpDir}/factories/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should delete existing nested factory', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate factory some/path/unit`)
      .then(() => {
        expect(shell.cat(`${this.tmpDir}/factories/some/path/unit.ts`).stdout).to.be.not.empty;
        execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js destroy factory some/path/unit`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${this.tmpDir}/factories/some/path/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });
});
