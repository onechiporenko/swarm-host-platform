import { generate, getFilesDiff, getTmpDir } from '../../utils/utils';
import { expect } from 'chai';
import shell = require('shelljs');
import { cd } from 'shelljs';

let tmpDir;

describe('Generate Factory', () => {

  beforeEach(() => {
    tmpDir = getTmpDir();
    shell.mkdir(tmpDir);
    cd(tmpDir);
  });

  afterEach(() => {
    cd('..');
    shell.rm('-rf', tmpDir);
  });

  it('should create an empty factory', () => {
    generate('factory', 'unit');
    expect(getFilesDiff('factories/unit.ts', '../tests/results/factories/empty-unit.txt')).to.be.empty;
  });

  it('should override existing factory', () => {
    generate('factory', 'unit');
    generate('factory', 'unit', ['name:string', 'age:number', 'squad:has-one:squad:units', 'objectives:has-many:objective'], 'y');
    expect(getFilesDiff('factories/unit.ts', '../tests/results/factories/unit-with-attrs-and-relations.txt')).to.be.empty;
  });

  it('should not override existing factory', () => {
    generate('factory', 'unit');
    generate('factory', 'unit', ['name:string'], 'n');
    expect(getFilesDiff('factories/unit.ts', '../tests/results/factories/empty-unit.txt')).to.be.empty;
  });

  it('should create a factory with attributes ans relations', () => {
    generate('factory', 'some/unit', ['name:string', 'age:number', 'squad:has-one:squad:units', 'objectives:has-many:objective']);
    expect(getFilesDiff('factories/some/unit.ts', '../tests/results/factories/unit-with-attrs-and-relations.txt')).to.be.empty;
  });

});
