import { Argv } from 'yargs';
import axios from 'axios';
import colors = require('colors/safe');

exports.command = 'delete <factoryName> <id>';
exports.aliases = ['d'];
exports.describe = 'delete an existing record';
exports.builder = (yargs: Argv) => {
  yargs.example('`swarm-host crud d cluster 1', 'Delete `cluster` with id `1`');
};

exports.handler = (argv) => {
  const url = `${argv.host}:${argv.port}/lair/factories/${argv.factoryName}/${argv.id}`;
  console.log(`Request to ${colors.yellow(url)} started`);
  axios
    .delete(url)
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
