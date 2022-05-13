import {
  fileExists,
  generate,
  getFilesDiff,
  getTmpDir,
} from '../../utils/utils';
import { expect } from 'chai';
import shell = require('shelljs');
import { cd, ShellString } from 'shelljs';

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
        '../tests/acceptance/results/routes/default-units.txt'
      )
    ).to.be.empty;
  });

  it('should create a route with custom url and method', () => {
    generate('route', 'units/new', ['--url=api/v1/units', '--method=post']);
    expect(fileExists('app/routes/units/new.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/routes/units/new.ts',
        '../tests/acceptance/results/routes/post-new-user.txt'
      )
    ).to.be.empty;
  });

  it('should create a route with class syntax', () => {
    generate('route', 'new/test', [
      '--url=a/:b/c',
      '--method=post',
      '--syntax=class',
    ]);
    expect(fileExists('app/routes/new/test.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/routes/new/test.ts',
        '../tests/acceptance/results/routes/route-class.txt'
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
        '../tests/acceptance/results/routes/dynamic-params.txt'
      )
    ).to.be.empty;
  });

  it('command should fail because of invalid path', () => {
    const cmdResult = generate('route', 'a/../b') as ShellString;
    expect(cmdResult.code).to.equal(1);
    expect(cmdResult.stderr).to.contain(
      'Path should not contain "..". You passed "a/../b"'
    );
  });
});
