import { destroy, fileExists, generate, getTmpDir } from '../../utils/utils';
import { expect } from 'chai';
import { cd, mkdir, rm } from 'shelljs';

let tmpDir;

describe('Destroy Factory', () => {
  beforeEach(() => {
    tmpDir = getTmpDir();
    mkdir(tmpDir);
    cd(tmpDir);
  });

  afterEach(() => {
    cd('..');
    rm('-rf', tmpDir);
  });

  it('should delete existing factory', () => {
    generate('factory', 'unit');
    expect(fileExists('app/factories/unit.ts')).to.be.true;
    destroy('factory', 'unit');
    expect(fileExists('app/factories/unit.ts')).to.be.false;
  });

  it('should not delete existing factory', () => {
    generate('factory', 'unit');
    expect(fileExists('app/factories/unit.ts')).to.be.true;
    destroy('factory', 'unit', [], 'n');
    expect(fileExists('app/factories/unit.ts')).to.be.true;
  });

  it('should delete existing nested factory', () => {
    generate('factory', 'some/path/unit');
    expect(fileExists('app/factories/some/path/unit.ts')).to.be.true;
    destroy('factory', 'some/path/unit');
    expect(fileExists('app/factories/some/path/unit.ts')).to.be.false;
  });

  it('should not delete existing nested factory', () => {
    generate('factory', 'some/path/unit');
    expect(fileExists('app/factories/some/path/unit.ts')).to.be.true;
    destroy('factory', 'some/path/unit', [], 'n');
    expect(fileExists('app/factories/some/path/unit.ts')).to.be.true;
  });

  it('command should fail because of invalid path', () => {
    const cmdResult = destroy('factory', 'a/../b');
    expect(cmdResult.status).to.equal(1);
    expect(cmdResult.stderr).to.contain(
      'Path should not contain "..". You passed "a/../b"'
    );
  });

  it('should delete factory and test file', () => {
    generate('factory', 'nested/parent');
    expect(fileExists('app/factories/nested/parent.ts')).to.be.true;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.true;
    destroy('factory', 'nested/parent');
    expect(fileExists('app/factories/nested/parent.ts')).to.be.false;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.false;
  });

  it('should delete only factory file', () => {
    generate('factory', 'nested/parent');
    expect(fileExists('app/factories/nested/parent.ts')).to.be.true;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.true;
    destroy('factory', 'nested/parent', ['--skip-test=true']);
    expect(fileExists('app/factories/nested/parent.ts')).to.be.false;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.true;
  });

  it('should delete only test file', () => {
    generate('factory', 'nested/parent');
    expect(fileExists('app/factories/nested/parent.ts')).to.be.true;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.true;
    destroy('factory', 'nested/parent', ['--skip-source=true']);
    expect(fileExists('app/factories/nested/parent.ts')).to.be.true;
    expect(fileExists('tests/unit/factories/nested/parent.ts')).to.be.false;
  });
});
