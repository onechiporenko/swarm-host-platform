import colors = require('colors/safe');
import { render } from 'ejs';
import fs = require('fs');
import path = require('path');
import { ShellString, mkdir } from 'shelljs';
import { Generate } from '../generate';
import FactoryAttr from './../../../models/factory-attr';
import { camelize, classify } from '../../../utils/string';

export class GenerateFactory extends Generate {
  getCustomFactoryImportString(
    customFactoryName: string,
    childPath: string,
    parentPath: string
  ): string {
    return `import ${customFactoryName} from '${this.getRelativePathForExtend(
      childPath,
      parentPath
    )}';`;
  }

  getCustomFactoryNameToExtend(path: string): string {
    const customFactoryName = path
      .split('/')
      .map((p) =>
        p
          .replace(/[^\d\w-]/g, '')
          .split('-')
          .map((i) => classify(i))
          .join('')
      )
      .join('');
    return `${customFactoryName}Factory`;
  }

  getImportPathForTestFile() {
    const separator = this.instance.dir.includes('/') ? '/' : '\\';
    const depth = this.instance.dir.split(separator).length;
    const mod = this.instance.dir === '' ? 2 : 3;
    return `${'../'.repeat(depth + mod)}app/${this.instance.type}/${
      this.instance.dir ? this.instance.dir + '/' : ''
    }${this.instance.name}`;
  }

  getRelativePathForExtend(childPath, parentPath): string {
    let child = childPath.split('/');
    child.pop();
    child = child.join('/');
    let parent = parentPath.split('/');
    const parentFactoryName = parent.pop();
    parent = parent.join('/');
    let relativePath = `${path
      .relative(child, parent)
      .replace(/\\/g, '/')}/${parentFactoryName}`;
    if (path.isAbsolute(relativePath)) {
      relativePath = `.${relativePath}`;
    }
    return relativePath.indexOf('.') === 0 ? relativePath : `./${relativePath}`;
  }

  getSwarmHostImports(attrs: FactoryAttr[]) {
    return attrs
      .map((attr) => attr.attrType)
      .filter((type, index, list) => list.indexOf(type) === index)
      .map((item) => camelize(item));
  }

  getSwarmHostImportString(imports: string[]): string {
    if (!imports.length) {
      return '';
    }
    return `import { ${imports.join(', ')} } from '@swarm-host/server';`;
  }

  public writeFiles(): void {
    if (!this.instance.options['skip-source']) {
      this.writeSourceFile();
    }
    if (!this.instance.options['skip-test']) {
      this.writeTestFile();
    }
  }

  public writeSourceFile() {
    const tpl = fs.readFileSync(
      path.join(__dirname, '../../../../blueprints/files/factory.ejs'),
      'utf-8'
    );
    mkdir('-p', this.instance.dirPath);
    const attrs: FactoryAttr[] = this.instance.options.rest.map(
      (attr) => new FactoryAttr(attr)
    );

    const extendCustomFactory = !!this.instance.options.extends;
    let customImport = '';
    let factory = 'Factory';
    if (extendCustomFactory) {
      factory = this.getCustomFactoryNameToExtend(
        this.instance.options.extends
      );
      customImport = this.getCustomFactoryImportString(
        factory,
        this.instance.pathToNewInstance,
        this.instance.options.extends
      );
    }

    const swarmHostImports = this.getSwarmHostImports(attrs);
    if (!extendCustomFactory) {
      swarmHostImports.unshift('Factory');
    }
    attrs.sort((attr1, attr2) => {
      if (attr1.attrType !== attr2.attrType) {
        return attr1.attrType > attr2.attrType ? 1 : -1;
      }
      return attr1.attrName > attr2.attrName ? 1 : -1;
    });
    const imports = this.getSwarmHostImportString(swarmHostImports);
    ShellString(
      render(tpl, {
        attrs,
        name: this.instance.name,
        imports,
        customImport:
          imports.length && customImport.length
            ? `\n${customImport}`
            : customImport,
        factory,
        className: classify(this.instance.name),
      })
    ).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }

  public writeTestFile() {
    mkdir('-p', this.instance.testsPath);
    const tpl = fs.readFileSync(
      path.join(__dirname, '../../../../blueprints/files/factory-test.ejs'),
      'utf-8'
    );
    ShellString(
      render(tpl, {
        name: this.instance.name,
        className: classify(this.instance.name),
        importPath: this.getImportPathForTestFile(),
      })
    ).to(this.instance.testFullPath);
    console.log(
      'Test for',
      colors.yellow(this.instance.relativePath),
      'is created'
    );
  }
}
