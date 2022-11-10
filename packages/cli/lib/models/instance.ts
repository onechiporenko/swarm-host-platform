import path = require('path');
import { Command } from './command';

export interface InstanceOptions {
  [k: string]: any;
  extends?: string;
  method?: string;
  rest?: string[];
  syntax?: string;
  url?: string;
}

export class Instance {
  public command: Command;
  public dir: string;
  public dirPath: string;
  public fileName: string;
  public fullPath: string;
  public name: string;
  public options: InstanceOptions;
  public pathToNewInstance: string;
  public relativePath: string;
  public testFullPath: string;
  public testsPath: string;
  public type: string;

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

  public setup(): void {
    return undefined;
  }
}
