import { /*Lair, */ Server } from '@swarm-host/server';
import argv from '../argv';

const server = Server.getServer();

// server.namespace = '/api/v1';
server.verbose = argv.verbose;
server.port = argv.port;
server.delay = argv.delay;

export default server;
