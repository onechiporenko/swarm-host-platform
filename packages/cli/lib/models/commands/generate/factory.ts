import colors = require('colors/safe');
import { render } from 'ejs';
import fs = require('fs');
import path = require('path');
import { echo, mkdir } from 'shelljs';
import { Generate } from '../generate';
import FactoryAttr from './../../../models/factory-attr';
import { camelize, classify } from '../../../utils/string';

export class GenerateFactory extends Generate {
  getCustomFactoryNameToExtend(path: string): string {
    const customFactoryName = path
      .split('/')
      .map((p) => classify(p.replace(/[^\d\w]/g, '')))
      .join('');
    return `${customFactoryName}Factory`;
  }

  getCustomFactoryImportString(
    customFactoryName: string,
    importSubPath: string
  ): string {
    return `import ${customFactoryName} from 'app/factories/${importSubPath}';`;
  }

  getSwarmHostImportString(imports: string[]): string {
    if (!imports.length) {
      return '';
    }
    return `import { ${imports.join(', ')} } from '@swarm-host/server';`;
  }

  getSwarmHostImports(attrs: FactoryAttr[]) {
    return attrs
      .map((attr) => attr.attrType)
      .filter((type, index, list) => list.indexOf(type) === index)
      .map((item) => camelize(item));
  }

  public writeFile(): void {
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
    echo(
      render(tpl, {
        attrs,
        name: this.instance.name,
        imports,
        customImport: imports.length && customImport.length ? `\n${customImport}` : customImport,
        factory,
        className: classify(this.instance.name),
      })
    ).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }
}
