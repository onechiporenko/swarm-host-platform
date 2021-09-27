import { getTmpDir } from '../../utils/utils';
import {expect} from 'chai';
import execa = require('execa');
import shell = require('shelljs');

let tmpDir;

describe('Destroy Factory', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
  });

  afterEach(() => shell.rm('-rf', tmpDir));

  it('should delete existing factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`)
      .then(a => {
        expect(shell.cat(`${tmpDir}/factories/unit.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy factory unit`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/factories/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should not delete existing factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/factories/unit.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy factory unit`, {input: 'n'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/factories/unit.ts`).stdout).to.be.not.empty;
            done();
          });
      });
  });

  it('should delete existing nested factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory some/path/unit`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/factories/some/path/unit.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy factory some/path/unit`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/factories/some/path/unit.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should not delete existing nested factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory some/path/unit`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/factories/some/path/unit.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy factory some/path/unit`, {input: 'n'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/factories/some/path/unit.ts`).stdout).to.be.not.empty;
            done();
          });
      });
  });
});
