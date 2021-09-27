import child = require('child_process');
import { exec, test } from 'shelljs';

export const getTmpDir = () => `swarm-host-tmp-${Math.random()}`.replace(/\./g, '');

export const execConfirm = (cmd: string, args: string[], input: string) => child.execFileSync(cmd, args, {input});

export const init = (args: string[] = []) => exec(`node ../dist/index.js init ${args.join(' ')}`);

export const generate = (type: string, path: string, args: string[] = [], input?: string) => {
  if (input) {
    execConfirm('node', ['../dist/index.js', 'g', type, path, ...args], input);
  } else {
    exec(`node ../dist/index.js g ${type} ${path} ${args.join(' ')}`, {silent: true});
  }
}

export const destroy = (type: string, path: string, input = 'y') => execConfirm('node', ['../dist/index.js', 'd', type, path], input);

export const fileExists = (path: string): boolean => test('-e', path);

export const getFilesDiff = (path1: string, path2: string) => exec(`diff --strip-trailing-cr ${path1} ${path2}`).stdout;
