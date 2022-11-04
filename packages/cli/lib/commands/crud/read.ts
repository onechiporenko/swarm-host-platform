import { Argv } from 'yargs';
import axios from 'axios';
import colors = require('colors/safe');

exports.command = 'read <factoryName> <id>';
exports.aliases = ['r'];
exports.describe = 'read an existing record';
exports.builder = (yargs: Argv) => {
  yargs.example('`swarm-host crud r cluster 1', 'Read `cluster` with id `1`');
};

exports.handler = (argv) => {
  const url = `${argv.host}:${argv.port}/lair/factories/${argv.factoryName}/${argv.id}`;
  console.log(`Request to ${colors.yellow(url)} started`);
  return axios
    .get(url)
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
