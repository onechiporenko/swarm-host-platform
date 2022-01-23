import server from './app/server';

server.addRoutesFromDir(`${__dirname}/app/routes`).then(() => {
  server.addFactoriesFromDir(`${__dirname}/app/factories`).then(() => {
    server.startServer();
  });
});
