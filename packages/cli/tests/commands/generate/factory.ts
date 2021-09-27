import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

let tmpDir;

describe('Generate Factory', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
  });

  afterEach(() => shell.rm('-rf', tmpDir));

  it('should create an empty factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        const original = shell.cat(`${tmpDir}/factories/unit.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/empty-unit.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should override existing factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit name:string age:number squad:has-one:squad:units objectives:has-many:objective`, {input: 'y'})
          .then(() => {
            const original = shell.cat(`${tmpDir}/factories/unit.ts`).stdout;
            const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/unit-with-attrs-and-relations.txt`)).stdout;
            expect(original).to.be.equal(expected);
            done();
          });
      });
  });

  it('should not override existing factory', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory unit`, {input: 'n'})
          .then(() => {
            const original = shell.cat(`${tmpDir}/factories/unit.ts`).stdout;
            const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/empty-unit.txt`)).stdout;
            expect(original).to.be.equal(expected);
            done();
          });
      });
  });

  it('should create a factory with attributes ans relations', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate factory some/unit name:string age:number squad:has-one:squad:units objectives:has-many:objective`)
      .then(() => {
        const original = shell.cat(`${tmpDir}/factories/some/unit.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/unit-with-attrs-and-relations.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

});
