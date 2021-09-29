import child = require('child_process');
import { exec, ShellString, test } from 'shelljs';

export const getTmpDir = (): string =>
  `swarm-host-tmp-${Math.random()}`.replace(/\./g, '');

export const execConfirm = (
  cmd: string,
  args: string[],
  input: string
): Buffer => child.execFileSync(cmd, args, { input });

export const init = (args: string[] = []): ShellString =>
  exec(`node ../dist/index.js init ${args.join(' ')}`);

export const generate = (
  type: string,
  path: string,
  args: string[] = [],
  input?: string
): ShellString | Buffer => {
  if (input) {
    return execConfirm(
      'node',
      ['../dist/index.js', 'g', type, path, ...args],
      input
    );
  }
  exec(`node ../dist/index.js g ${type} ${path} ${args.join(' ')}`, {
    silent: true,
  });
};

export const destroy = (type: string, path: string, input = 'y'): Buffer =>
  execConfirm('node', ['../dist/index.js', 'd', type, path], input);

export const fileExists = (path: string): boolean => test('-e', path);

export const getFilesDiff = (path1: string, path2: string): string =>
  exec(`diff --strip-trailing-cr ${path1} ${path2}`).stdout;
