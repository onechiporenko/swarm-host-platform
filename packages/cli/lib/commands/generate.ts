exports.command = 'generate <command>';
exports.aliases = ['g'];
exports.desc = 'generate some instance';
exports.builder = yargs => yargs.commandDir('generate');
