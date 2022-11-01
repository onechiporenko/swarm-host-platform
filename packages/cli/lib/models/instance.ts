import path = require('path');
import { Command } from './command';

export interface InstanceOptions {
  url?: string;
  syntax?: string;
  method?: string;
  extends?: string;
  rest?: string[];
  [k: string]: any;
}

export class Instance {
  public options: InstanceOptions;
  public pathToNewInstance: string;
  public name: string;
  public dir: string;
  public fileName: string;
  public fullPath: string;
  public dirPath: string;
  public relativePath: string;
  public type: string;
  public command: Command;
  public testsPath: string;
  public testFullPath: string;

  constructor(
    pathToNewInstance: string,
    options: InstanceOptions,
    command: Command
  ) {
    this.setup();
    this.options = options;
    this.command = command;
    this.command.instance = this;
    this.parsePath(pathToNewInstance);
  }

  public setup(): void {
    return undefined;
  }

  public parsePath(pathToNewInstance: string): void {
    const p = path.parse(pathToNewInstance);
    this.pathToNewInstance = pathToNewInstance;
    this.name = p.name;
    this.dir = p.dir;
    this.dirPath = path.join(process.cwd(), 'app', this.type, p.dir);
    this.fileName = `${p.name}.ts`;
    this.fullPath = path.join(this.dirPath, this.fileName);
    this.relativePath = path.join(this.type, p.dir, this.fileName);
  }
}
