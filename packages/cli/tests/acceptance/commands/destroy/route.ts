import { destroy, fileExists, generate, getTmpDir } from '../../utils/utils';
import { expect } from 'chai';
import shell = require('shelljs');
import { cd } from 'shelljs';

let tmpDir;

describe('Destroy Route', () => {
  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
    cd(tmpDir);
  });

  afterEach(() => {
    cd('..');
    shell.rm('-rf', tmpDir);
  });

  it('should delete existing route', () => {
    generate('route', 'units');
    expect(fileExists('app/routes/units.ts')).to.be.true;
    destroy('route', 'units');
    expect(fileExists('app/routes/units.ts')).to.be.false;
  });

  it('should not delete existing route', () => {
    generate('route', 'units');
    expect(fileExists('app/routes/units.ts')).to.be.true;
    destroy('route', 'units', [], 'n');
    expect(fileExists('app/routes/units.ts')).to.be.true;
  });

  it('should delete existing nested route', () => {
    generate('route', 'all/units');
    expect(fileExists('app/routes/all/units.ts')).to.be.true;
    destroy('route', 'all/units');
    expect(fileExists('app/routes/all/units.ts')).to.be.false;
  });

  it('should not delete existing nested route', () => {
    generate('route', 'all/units');
    expect(fileExists('app/routes/all/units.ts')).to.be.true;
    destroy('route', 'all/units', [], 'n');
    expect(fileExists('app/routes/all/units.ts')).to.be.true;
  });

  it('command should fail because of invalid path', () => {
    const cmdResult = destroy('route', 'a/../b');
    expect(cmdResult.status).to.equal(1);
    expect(cmdResult.stderr).to.contain(
      'Path should not contain "..". You passed "a/../b"'
    );
  });

  it('should delete only test and schema files', () => {
    generate('route', 'test/route');
    expect(fileExists('app/routes/test/route.ts'), 'source file exists').to.be
      .true;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test file exists'
    ).to.be.true;
    expect(fileExists('schemas/test/route.ts'), 'schema file exists').to.be
      .true;
    destroy('route', 'test/route', ['--skip-source=true']);
    expect(fileExists('app/routes/test/route.ts'), 'source is not deleted').to
      .be.true;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test is deleted'
    ).to.be.false;
    expect(fileExists('schemas/test/route.ts'), 'schema is deleted').to.be
      .false;
  });

  it('should delete only source file', () => {
    generate('route', 'test/route');
    expect(fileExists('app/routes/test/route.ts'), 'source file exists').to.be
      .true;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test file exists'
    ).to.be.true;
    expect(fileExists('schemas/test/route.ts'), 'schema file exists').to.be
      .true;
    destroy('route', 'test/route', ['--skip-test=true']);
    expect(fileExists('app/routes/test/route.ts'), 'source is deleted').to.be
      .false;
    expect(
      fileExists('tests/integration/routes/test/route.ts'),
      'test is not deleted'
    ).to.be.true;
    expect(fileExists('schemas/test/route.ts'), 'schema is not deleted').to.be
      .true;
  });
});
