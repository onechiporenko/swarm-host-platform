import { Argv } from 'yargs';
import axios from 'axios';
import colors = require('colors/safe');

exports.command = 'update <factoryName> <id> <json>';
exports.aliases = ['u'];
exports.describe = 'update an existing record';
exports.builder = (yargs: Argv) => {
  yargs.check((argv) => {
    JSON.parse(`${argv.json}`);
    return true;
  });
  yargs.example(
    '`swarm-host crud u cluster 1 "{name: \'newName\'}"',
    'Update field `name` for `cluster` with id `1`'
  );
};

exports.handler = async (argv) => {
  const url = `${argv.host}:${argv.port}/lair/factories/${argv.factoryName}/${argv.id}`;
  console.log(`Request to ${colors.yellow(url)} started`);
  await axios
    .put(url, JSON.parse(`${argv.json}`))
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
