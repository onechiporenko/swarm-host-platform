import child = require('child_process');
import { SpawnSyncReturns } from 'child_process';
import { ShellString, exec, test } from 'shelljs';

export const getTmpDir = (): string =>
  `swarm-host-tmp-${Math.random()}`.replace(/\./g, '');

export const execConfirm = (
  cmd: string,
  args: string[],
  input: string
): SpawnSyncReturns<string> =>
  child.spawnSync(cmd, args, { input, encoding: 'utf8' });

export const init = (args: string[] = []): ShellString =>
  exec(`node ../dist/index.js init ${args.join(' ')}`);

export const generate = (
  type: string,
  path: string,
  args: string[] = [],
  input?: string
): ShellString | SpawnSyncReturns<string> => {
  if (input) {
    return execConfirm(
      'node',
      ['../dist/index.js', 'g', type, path, ...args],
      input
    );
  }
  return exec(`node ../dist/index.js g ${type} ${path} ${args.join(' ')}`, {
    silent: true,
  });
};

export const destroy = (
  type: string,
  path: string,
  args: string[] = [],
  input = 'y'
): SpawnSyncReturns<string> =>
  execConfirm('node', ['../dist/index.js', 'd', type, path, ...args], input);

export const fileExists = (path: string): boolean => test('-e', path);

export const getFilesDiff = (path1: string, path2: string): string =>
  exec(`diff --strip-trailing-cr ${path1} ${path2}`).stdout;
