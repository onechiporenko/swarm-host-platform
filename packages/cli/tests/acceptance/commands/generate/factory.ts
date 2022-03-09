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
    expect(fileExists('app/factories/unit.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/unit.ts',
        '../tests/acceptance/results/factories/empty-unit.txt'
      )
    ).to.be.empty;
  });

  it('should override existing factory', () => {
    generate('factory', 'unit');
    generate(
      'factory',
      'unit',
      [
        'name:string',
        'age:number',
        'squad:has-one:squad:units',
        'objectives:has-many:objective',
      ],
      'y'
    );
    expect(fileExists('app/factories/unit.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/unit.ts',
        '../tests/acceptance/results/factories/unit-with-attrs-and-relations.txt'
      )
    ).to.be.empty;
  });

  it('should not override existing factory', () => {
    generate('factory', 'unit');
    generate('factory', 'unit', ['name:string'], 'n');
    expect(fileExists('app/factories/unit.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/unit.ts',
        '../tests/acceptance/results/factories/empty-unit.txt'
      )
    ).to.be.empty;
  });

  it('should create a factory with attributes ans relations', () => {
    generate('factory', 'some/unit', [
      'name:string',
      'age:number',
      'squad:has-one:squad:units',
      'objectives:has-many:objective',
    ]);
    expect(fileExists('app/factories/some/unit.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/some/unit.ts',
        '../tests/acceptance/results/factories/unit-with-attrs-and-relations.txt'
      )
    ).to.be.empty;
  });

  it('should create an empty factory extends another one', () => {
    generate('factory', 'child', ['--extends=parent']);
    expect(fileExists('app/factories/child.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/child.ts',
        '../tests/acceptance/results/factories/empty-child-extends-parent.txt'
      )
    ).to.be.empty;
  });

  it('should create a factory with attributes and relations extends another one', () => {
    generate('factory', 'child', [
      '--extends=parent',
      'name:string',
      'age:number',
      'squad:has-one:squad:units',
      'objectives:has-many:objective',
    ]);
    expect(fileExists('app/factories/child.ts')).to.be.true;
    expect(
      getFilesDiff(
        'app/factories/child.ts',
        '../tests/acceptance/results/factories/child-extends-parent.txt'
      )
    ).to.be.empty;
  });

  it('command should fail because of invalid path', () => {
    const cmdResult = generate('factory', 'a/../b') as ShellString;
    expect(cmdResult.code).to.equal(1);
    expect(cmdResult.stderr).to.contain(
      'Path should not contain "..". You passed "a/../b"'
    );
  });
});
