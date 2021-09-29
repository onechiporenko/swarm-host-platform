import colors = require('colors/safe');
import { render } from 'ejs';
import fs = require('fs');
import path = require('path');
import { echo, mkdir } from 'shelljs';
import { Generate } from '../generate';
import FactoryAttr from './../../../models/factory-attr';

export class GenerateFactory extends Generate {
  public writeFile(): void {
    const tpl = fs.readFileSync(
      path.join(__dirname, '../../../../blueprints/files/factory.ejs'),
      'utf-8'
    );
    mkdir('-p', this.instance.dirPath);
    const attrs: FactoryAttr[] = this.instance.options.rest.map(
      (attr) => new FactoryAttr(attr)
    );
    attrs.sort((attr1, attr2) => {
      if (attr1.attrType !== attr2.attrType) {
        return attr1.attrType > attr2.attrType ? 1 : -1;
      }
      return attr1.attrName > attr2.attrName ? 1 : -1;
    });
    echo(
      render(tpl, {
        attrs,
        name: this.instance.name,
      })
    ).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }
}
