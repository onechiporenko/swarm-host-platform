import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

describe('Generate Factory', () => {

  beforeEach(() => {
    this.tmpDir = getTmpDir();
    shell.mkdir(this.tmpDir);
  });

  afterEach(() => shell.rm('-rf', this.tmpDir));

  it('should create an empty factory', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate factory unit`)
      .then(() => {
        const original = shell.cat(`${this.tmpDir}/factories/unit.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/empty-unit.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should create a factory with attributes ans relations', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate factory some/unit name:string age:number squad:has-one:squad:units objectives:has-many:objective`)
      .then(() => {
        const original = shell.cat(`${this.tmpDir}/factories/some/unit.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/factories/unit-with-attrs-and-relations.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

});
