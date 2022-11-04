import { Argv } from 'yargs';
import axios from 'axios';
import colors = require('colors/safe');

exports.command = 'create <factoryName> <json>';
exports.aliases = ['c'];
exports.describe = 'create a new record';
exports.builder = (yargs: Argv) => {
  yargs.check((argv) => {
    JSON.parse(`${argv.json}`);
    return true;
  });
  yargs.example(
    '`swarm-host crud c cluster "{name: \'newName\'}"',
    'Create a new cluster'
  );
};

exports.handler = (argv) => {
  const url = `${argv.host}:${argv.port}/lair/factories/${argv.factoryName}`;
  console.log(`Request to ${colors.yellow(url)} started`);
  return axios
    .post(url, JSON.parse(`${argv.json}`))
    .then((result) =>
      console.log(
        `${colors.green('Request passed with:')}\n${JSON.stringify(
          result.data || '{}',
          null,
          2
        )}`
      )
    )
    .catch((e) => console.log(colors.red(`Request failed with:\n${e}`)));
};
