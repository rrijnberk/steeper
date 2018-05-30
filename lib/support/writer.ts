const writeAdoc = require('./writers/adoc.writer.ts');
const writeSASS = require('./writers/sass.writer.ts');

exports.writer = {
    writeAdoc,
    writeSASS
};
