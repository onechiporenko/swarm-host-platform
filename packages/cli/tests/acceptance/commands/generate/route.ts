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

  it('should create a route with test and schema files', () => {
    generate('route', 'route', ['--url=test/route']);
    expect(fileExists('app/routes/route.ts'), 'source file exists').to.be.true;
    expect(fileExists('tests/integration/routes/route.ts'), 'test file exists')
      .to.be.true;
    expect(
      getFilesDiff(
        'tests/integration/routes/route.ts',
        '../tests/acceptance/results/routes/route-test.txt'
      )
    ).to.be.empty;
    expect(fileExists('schemas/route.ts'), 'schema file exists').to.be.true;
    expect(
      getFilesDiff(
        'schemas/route.ts',
        '../tests/acceptance/results/routes/route-schema.txt'
      )
    ).to.be.empty;
  });

  it('should create a route with test and schema files (nested)', () => {
    generate('route', 'test/route', ['--url=test/route']);
    expect(fileExists('app/routes/test/route.ts'), 'source file exists').to.be
      .true;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test file exists'
    ).to.be.true;
    expect(
      getFilesDiff(
        'tests/integration/routes/test/route.ts',
        '../tests/acceptance/results/routes/nested-route-test.txt'
      )
    ).to.be.empty;
    expect(fileExists('schemas/test/route.ts'), 'schema file exists').to.be
      .true;
    expect(
      getFilesDiff(
        'schemas/test/route.ts',
        '../tests/acceptance/results/routes/route-schema.txt'
      )
    ).to.be.empty;
  });

  it('should create only test and schema files', () => {
    generate('route', 'test/route', ['--skip-source=true']);
    expect(fileExists('app/routes/test/route.ts'), 'source file does not exist')
      .to.be.false;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test file exists'
    ).to.be.true;
    expect(fileExists('schemas/test/route.ts'), 'schema file exists').to.be
      .true;
  });

  it('should create only source file', () => {
    generate('route', 'test/route', ['--skip-test=true']);
    expect(fileExists('app/routes/test/route.ts'), 'source file exists').to.be
      .true;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test file does not exist'
    ).to.be.false;
    expect(fileExists('schemas/test/route.ts'), 'schema file does not exist').to
      .be.false;
  });
});
