import fs = require('fs');
import path = require('path');
import colors = require('colors/safe');
import { render } from 'ejs';
import { ShellString, mkdir, test } from 'shelljs';
import { Generate } from '../generate';
import { camelize, classify } from '../../../utils/string';
import { RouteInstance } from '../../instances/route';

export class GenerateRoute extends Generate {
  public instance: RouteInstance;

  protected dynamic: string[];
  protected url: string;

  public lintFiles() {
    super.lintFiles();
    if (
      this.linterInstalled() &&
      !this.instance.options['skip-lint'] &&
      !this.instance.options['skip-test']
    ) {
      this.lintFile(this.instance.schemasFullPath);
    }
  }

  public someFilesAlreadyExist(): boolean {
    return (
      super.someFilesAlreadyExist() ||
      (test('-e', this.instance.schemasFullPath) &&
        !this.instance.options['skip-test'])
    );
  }

  public writeFiles(): void {
    this.setup();
    if (!this.instance.options['skip-source']) {
      this.writeSourceFile();
    }
    if (!this.instance.options['skip-test']) {
      this.writeSchemaFile();
      this.writeTestFile();
    }
  }

  public writeSchemaFile() {
    mkdir('-p', this.instance.schemasPath);
    const tpl = fs.readFileSync(
      path.join(__dirname, `../../../../blueprints/files/default-schema.ejs`),
      'utf-8'
    );
    ShellString(render(tpl, {})).to(this.instance.schemasFullPath);
    console.log(
      'Schema for',
      colors.yellow(this.instance.relativePath),
      'is created'
    );
  }

  public writeSourceFile() {
    const useClassSyntax = this.instance.options.syntax === 'class';
    const tpl = fs.readFileSync(
      path.join(
        __dirname,
        `../../../../blueprints/files/${
          useClassSyntax ? 'route-class' : 'route'
        }.ejs`
      ),
      'utf-8'
    );
    mkdir('-p', this.instance.dirPath);
    ShellString(
      render(tpl, {
        method: this.instance.options.method,
        req: this.dynamic.length
          ? `{params: {${this.dynamic.join(', ')}}}`
          : 'req',
        className: classify(this.instance.name),
        url: this.url,
      })
    ).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }

  public writeTestFile() {
    mkdir('-p', this.instance.testsPath);
    const tpl = fs.readFileSync(
      path.join(
        __dirname,
        `../../../../blueprints/files/${
          this.instance.options['parent-model']
            ? 'route-test-nested.ejs'
            : 'route-test.ejs'
        }`
      ),
      'utf-8'
    );
    const separator = this.instance.dir.includes('/') ? '/' : '\\';
    const depth = this.instance.dir.split(separator).length;
    const mod = this.instance.dir === '' ? 2 : 3;
    const constPath = `${'../'.repeat(depth + mod - 1)}consts`;
    const parentModelName = this.instance.options['parent-model'];
    const childModelName = this.instance.name;
    const parentModelNameResponse = `${parentModelName}Response`;
    const childModelNameResponse = `${childModelName}Response`;
    const schemasPath = `${'../'.repeat(depth + mod)}schemas/${
      this.instance.dir ? this.instance.dir + '/' : ''
    }${this.instance.name}`;
    ShellString(
      render(tpl, {
        method: this.instance.options.method.toLowerCase(),
        urlForRequest: this.url.replace(
          `:${this.dynamic[0]}`,
          `\${${parentModelNameResponse}.data[0].id}`
        ),
        url: this.url,
        schemaName: `${camelize(this.instance.name)}Schema`,
        parentModelName,
        parentModelNameResponse,
        childModelName,
        childModelNameResponse,
        schemasPath,
        constPath,
      })
    ).to(this.instance.testFullPath);
    console.log(
      'Test for',
      colors.yellow(this.instance.relativePath),
      'is created'
    );
  }

  protected setup() {
    this.url =
      this.instance.options.url ||
      path.join(this.instance.dir, this.instance.name).replace(/\\/g, '/');
    if (this.url[0] !== '/') {
      this.url = `/${this.url}`;
    }
    this.dynamic = this.url
      .split('/')
      .filter((c) => c[0] === ':')
      .map((c) => c.substr(1));
  }
}
