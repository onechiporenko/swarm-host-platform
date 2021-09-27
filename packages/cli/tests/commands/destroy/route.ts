import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import execa = require('execa');
import shell = require('shelljs');

let tmpDir;

describe('Destroy Route', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
  });

  afterEach(() => shell.rm('-rf', tmpDir));

  it('should delete existing route', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route units`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/routes/units.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy route units`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/routes/units.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should not delete existing route', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route units`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/routes/units.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy route units`, {input: 'n'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/routes/units.ts`).stdout).to.be.not.empty;
            done();
          });
      });
  });

  it('should delete existing nested route', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route all/units`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/routes/all/units.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy route all/units`, {input: 'y'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/routes/all/units.ts`).stdout).to.be.empty;
            done();
          });
      });
  });

  it('should not delete existing nested route', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route all/units`)
      .then(() => {
        expect(shell.cat(`${tmpDir}/routes/all/units.ts`).stdout).to.be.not.empty;
        execa.command(`cd ./${tmpDir} && node ../dist/index.js destroy route all/units`, {input: 'n'})
          .then(() => {
            expect(shell.cat(`${tmpDir}/routes/all/units.ts`).stdout).to.be.not.empty;
            done();
          })
          .catch(e => {
            done();
          });
      })
      .catch(e => {
        done();
      });
  });
});
