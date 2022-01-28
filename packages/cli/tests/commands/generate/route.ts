import {
  fileExists,
  generate,
  getFilesDiff,
  getTmpDir,
} from '../../utils/utils';
import { expect } from 'chai';
import shell = require('shelljs');
import { cd } from 'shelljs';

let tmpDir;

describe('Generate Route', () => {
  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
    cd(tmpDir);
  });

  afterEach(() => {
    cd('..');
    shell.rm('-rf', tmpDir);
  });

  it('should create default route', () => {
    generate('route', 'units');
    expect(fileExists('app/routes/units.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/routes/units.ts',
        '../tests/results/routes/default-units.txt'
      )
    ).to.be.empty;
  });

  it('should create a route with custom url and method', () => {
    generate('route', 'units/new', ['--url=api/v1/units', '--method=post']);
    expect(fileExists('app/routes/units/new.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/routes/units/new.ts',
        '../tests/results/routes/post-new-user.txt'
      )
    ).to.be.empty;
  });

  it('should create a route with dynamic parameters', () => {
    generate('route', 'units/unit/objectives/objective', [
      '--url=units/:unit_id/objectives/:objective_id',
    ]);
    expect(fileExists('app/routes/units/unit/objectives/objective.ts')).to.be
      .true;
    expect(
      getFilesDiff(
        'app/routes/units/unit/objectives/objective.ts',
        '../tests/results/routes/dynamic-params.txt'
      )
    ).to.be.empty;
  });
});
