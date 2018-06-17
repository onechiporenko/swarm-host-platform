import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

describe('Generate Route', () => {

  beforeEach(() => {
    this.tmpDir = getTmpDir();
    shell.mkdir(this.tmpDir);
  });

  afterEach(() => shell.rm('-rf', this.tmpDir));

  it('should create default route', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate route units`)
      .then(() => {
        const original = shell.cat(`${this.tmpDir}/routes/units.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/default-units.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should create a route with custom url and method', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate route units/new --url=api/v1/units --method=post`)
      .then(() => {
        const original = shell.cat(`${this.tmpDir}/routes/units/new.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/post-new-user.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should create a route with dynamic parameters', done => {
    execa.shell(`cd ./${this.tmpDir} && node ../dist/index.js generate route units/unit/objectives/objective --url=units/:unit_id/objectives/:objective_id`)
      .then(() => {
        const original = shell.cat(`${this.tmpDir}/routes/units/unit/objectives/objective.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/dynamic-params.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

});
