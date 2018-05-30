const TEATypes = require('../../models/tea-types.ts');

const config = require('./../config.ts');
const EOL = '\n';

let adocContent;

function writeAdoc(types) {
    adocContent = '';
    types.map(parserWrapper());

    adocContent = Array.from(new Set(adocContent.split('\n').sort())).join('\n');

    console.log(adocContent);
}

function parserWrapper(construct = {}) {
    return function (key, values) {
        parser(key, values, construct);
    }
}

function parser(key, values, construct) {
    let composite = {};
    if (key.type == TEATypes.ATTRIBUTE) {
        adocContent += printVariableLine(
            construct.type, construct.element, construct.modifier, key, values.value, values.description);

    } else {
        composite[key.type] = key;
        composite = Object.assign(composite, construct);
        values.value.map(parserWrapper(composite));
    }
}

function printVariableLine(type, element, modifier, attribute, value, description) {
    let line = `| $${type.name}`;
    line += element && element.name ? `__${element.name}` : '';
    line += attribute ? `--${attribute.name}` : '';
    line += modifier ? `---${modifier.name}` : '';
    line += `| ${value} | ${description} | ${EOL}`;
    return line;
}

module.exports = writeAdoc;
