exports.command = 'destroy <command>';
exports.aliases = ['d'];
exports.desc = 'destroy some instance';
exports.builder = yargs => yargs.commandDir('destroy');
