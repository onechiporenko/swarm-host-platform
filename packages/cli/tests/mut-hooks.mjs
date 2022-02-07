import shell from 'shelljs';

export const mochaHooks = {
  beforeEach() {
    shell.exec('rm -rf dist');
    shell.exec('yarn run build:mut');
  }
};
