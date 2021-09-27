import { destroy, fileExists, generate, getTmpDir } from '../../utils/utils';
import { expect } from 'chai';
import { cd, mkdir, test, rm } from 'shelljs';

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
    expect(fileExists('factories/unit.ts')).to.be.true;
    destroy('factory', 'unit');
    expect(fileExists('factories/unit.ts')).to.be.false;
  });

  it('should not delete existing factory', () => {
    generate('factory', 'unit');
    expect(fileExists('factories/unit.ts')).to.be.true;
    destroy('factory', 'unit', 'n');
    expect(fileExists('factories/unit.ts')).to.be.true;
  });

  it('should delete existing nested factory', () => {
    generate('factory', 'some/path/unit');
    expect(fileExists('factories/some/path/unit.ts')).to.be.true;
    destroy('factory', 'some/path/unit');
    expect(fileExists('factories/some/path/unit.ts')).to.be.false;
  });

  it('should not delete existing nested factory', () => {
    generate('factory', 'some/path/unit');
    expect(fileExists('factories/some/path/unit.ts')).to.be.true;
    destroy('factory', 'some/path/unit', 'n');
    expect(fileExists('factories/some/path/unit.ts')).to.be.true;
  });
});
