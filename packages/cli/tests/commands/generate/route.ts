import {getTmpDir} from '../../utils/utils';
import {expect} from 'chai';
import path = require('path');
import execa = require('execa');
import shell = require('shelljs');

let tmpDir;

describe('Generate Route', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
  });

  afterEach(() => shell.rm('-rf', tmpDir));

  it('should create default route', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route units`)
      .then(() => {
        const original = shell.cat(`${tmpDir}/routes/units.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/default-units.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should create a route with custom url and method', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route units/new --url=api/v1/units --method=post`)
      .then(() => {
        const original = shell.cat(`${tmpDir}/routes/units/new.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/post-new-user.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

  it('should create a route with dynamic parameters', done => {
    execa.command(`cd ./${tmpDir} && node ../dist/index.js generate route units/unit/objectives/objective --url=units/:unit_id/objectives/:objective_id`)
      .then(() => {
        const original = shell.cat(`${tmpDir}/routes/units/unit/objectives/objective.ts`).stdout;
        const expected = shell.cat(path.join(process.cwd(), `tests/results/routes/dynamic-params.txt`)).stdout;
        expect(original).to.be.equal(expected);
        done();
      });
  });

});
