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
    expect(fileExists('routes/units.ts')).to.be.true;
    destroy('route', 'units');
    expect(fileExists('routes/units.ts')).to.be.false;
  });

  it('should not delete existing route', () => {
    generate('route', 'units');
    expect(fileExists('routes/units.ts')).to.be.true;
    destroy('route', 'units', 'n');
    expect(fileExists('routes/units.ts')).to.be.true;
  });

  it('should delete existing nested route', () => {
    generate('route', 'all/units');
    expect(fileExists('routes/all/units.ts')).to.be.true;
    destroy('route', 'all/units');
    expect(fileExists('routes/all/units.ts')).to.be.false;
  });

  it('should not delete existing nested route', () => {
    generate('route', 'all/units');
    expect(fileExists('routes/all/units.ts')).to.be.true;
    destroy('route', 'all/units', 'n');
    expect(fileExists('routes/all/units.ts')).to.be.true;
  });
});
