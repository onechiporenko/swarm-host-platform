import colors = require('colors/safe');
import ejs = require('ejs');
import fs = require('fs');
import path = require('path');
import shell = require('shelljs');
import { Generate } from '../generate';

export class GenerateRoute extends Generate {
  public execute() {
    let url: string = this.instance.options.url || path.join(this.instance.dir, this.instance.name);
    if (url[0] !== '/') {
      url = `/${url}`;
    }
    const dynamic = url.split('/').filter(c => c[0] === ':').map(c => c.substr(1));
    const tpl = fs.readFileSync(path.join(__dirname, '../../../../blueprints/files/route.ejs'), 'utf-8');
    shell.mkdir('-p', this.instance.dirPath);
    shell.echo(ejs.render(tpl, {
      method: this.instance.options.method,
      req: dynamic.length ? `{params: {${dynamic.join(', ')}}}` : 'req',
      url
    })).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }
}
