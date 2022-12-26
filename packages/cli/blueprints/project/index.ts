import server from './app/server';
import serverSetup from './server-setup';

server.addRoutesFromDir(`${__dirname}/app/routes`).then(() => {
  server.addFactoriesFromDir(`${__dirname}/app/factories`).then(() => {
    serverSetup(server);
    server.startServer();
  });
});
