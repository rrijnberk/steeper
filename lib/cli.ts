#! /usr/bin/env node

const { reader } = require('./support/reader.ts');
const { teaConstructor } = require('./distillery/tea-constructor.ts');
const { writer } = require('./support/writer.ts');

reader.sources().then(sources => {
    const teaConstruct = teaConstructor.parse(sources);
    writer.writeSASS(teaConstruct);
    writer.writeAdoc(teaConstruct);
});


