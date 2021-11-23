import { /*Lair, */ Server } from 'swarm-host';

const server = Server.getServer();

// server.namespace = '/api/v1';
// server.verbose = true;
// server.port = 12345;
// server.delay = 200;

server.addRoutesFromDir(`${__dirname}/routes`);
server.addFactoriesFromDir(`${__dirname}/factories`);

export default server;
