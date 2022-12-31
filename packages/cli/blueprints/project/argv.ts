import yargs from 'yargs';

import { hideBin } from 'yargs/helpers';

export default yargs(hideBin(process.argv)).options({
  port: {
    default: 54321,
    group: 'Server',
    type: 'number',
  },
  delay: {
    default: 0,
    group: 'Server',
    description: 'Response delay',
    type: 'number',
  },
  verbose: {
    default: true,
    group: 'Server',
    type: 'boolean',
  },
})
  .wrap(150)
  .parseSync();
