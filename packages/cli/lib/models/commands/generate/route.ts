import fs = require('fs');
import path = require('path');
import colors = require('colors/safe');
import { render } from 'ejs';
import { mkdir, echo } from 'shelljs';
import { Generate } from '../generate';

export class GenerateRoute extends Generate {
  public writeFile(): void {
    let url: string =
      this.instance.options.url ||
      path.join(this.instance.dir, this.instance.name).replace(/\\/g, '/');
    if (url[0] !== '/') {
      url = `/${url}`;
    }
    const dynamic = url
      .split('/')
      .filter((c) => c[0] === ':')
      .map((c) => c.substr(1));
    const tpl = fs.readFileSync(
      path.join(__dirname, '../../../../blueprints/files/route.ejs'),
      'utf-8'
    );
    mkdir('-p', this.instance.dirPath);
    echo(
      render(tpl, {
        method: this.instance.options.method,
        req: dynamic.length ? `{params: {${dynamic.join(', ')}}}` : 'req',
        url,
      })
    ).to(this.instance.fullPath);
    console.log(colors.yellow(this.instance.relativePath), 'is created');
  }
}
