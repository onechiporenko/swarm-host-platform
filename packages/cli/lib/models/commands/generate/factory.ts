import colors = require('colors/safe');
import ejs = require('ejs');
import fs = require('fs');
import path = require('path');
import shell = require('shelljs');
import {Generate} from '../generate';
import FactoryAttr from './../../../models/factory-attr';

export class GenerateFactory extends Generate {
  public writeFile() {
    const tpl = fs.readFileSync(path.join(__dirname, '../../../../blueprints/files/factory.ejs'), 'utf-8');
    shell.mkdir('-p', this.instance.dirPath);
    shell.echo(ejs.render(tpl, {
      attrs: this.instance.options.rest.map(attr => new FactoryAttr(attr)).sort((attr1, attr2) => attr1.attrType > attr2.attrType),
      name: this.instance.name
    })).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }
}
