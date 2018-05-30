const fs = require('fs-extra');
const path = require('path');
const TEATypes = require('../../models/tea-types.ts');

const config = require('./../config.ts');
const EOL = '\n';

let typesContent;

function writeSASS(types) {
    typesContent = {};
    types.map(writeTypeFileCallback());

    writeSassAggregateFile(Object.keys(typesContent).map(writeSASSTypeFile));
}

function writeSassAggregateFile(files) {
    const imports = files.map(type => `@import "${type}";\n`).join('');
    const postfix = config.target.postfix ? '.' + config.target.postfix : '';
    const target = path.resolve('./', config.target.dir, `${config.target.name}${postfix}.scss`);
    fs.ensureFileSync(target);
    fs.writeFileSync(target, imports);

}

function writeSASSTypeFile(type) {
    const postfix = config.target.postfix ? '.' + config.target.postfix : '';
    const target = path.resolve('./', config.target.dir, `_${type}${postfix}.scss`);
    fs.ensureFileSync(target);
    fs.writeFileSync(target, typesContent[type]);
    return type;
}

function writeTypeFileCallback(construct = {}) {
    return function (key, values) {
        writeTypeFile(key, values, construct);
    }
}

function writeTypeFile(key, values, construct) {
    let composite = {};
    if (key.type == TEATypes.ATTRIBUTE) {
        typesContent[construct.type.name] =
            (typesContent[construct.type.name] || '').concat(printSassVariableLine(
                construct.type, construct.element, construct.modifier, key, values.value));
    } else {
        composite[key.type] = key;
        composite = Object.assign(composite, construct);
        values.value.map(writeTypeFileCallback(composite));
    }
}

function printSassVariableLine(type, element, modifier, attribute, value) {
    let line = `$${type.name}`;
    line += element && element.name ? `__${element.name}` : '';
    line += attribute ? `--${attribute.name}` : '';
    line += modifier ? `---${modifier.name}` : '';
    line += `: ${value};${EOL}`;
    return line;
}

module.exports = writeSASS;