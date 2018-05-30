const fs = require('fs-extra');
const path = require('path');

const TEATypes = require('../../models/tea-types.ts');

const config = require('./../config.ts');

const adocVariablesRetriever = /\|(?:.)*\|(?:\n\|(?:.)*\|){0,}/g;
const adocVariableWrapper = ``;
const EOL = '\n';
const separator = '\n';
const splitter = 'x---x---x\n';

let adocContent;

function writeAdoc(types) {
    adocContent = '';
    types.map(parserWrapper());

    adocContent = adocContent.replace(/\n\n\n/g, '\n\n');
    sortAdocVariables()
        .map(writeAdocContent);
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
        printCategory(key, values);
        composite[key.type] = key;
        composite = Object.assign(composite, construct);
        values.value.map(parserWrapper(composite));
    }
}

function printCategory(key, value) {
    let categoryLine = '\n=',
        description = value.description;
    switch (key.type) {
        case TEATypes.MODIFIER:
            categoryLine += '=';
        case TEATypes.ELEMENT:
            categoryLine += '=';
        case TEATypes.TYPE:
            categoryLine += '=';
    }
    categoryLine += ` ${key.name}\n${sanitizeDescription(description) || `No description was given for this ${key.type}.\n\n`}`;
    adocContent += categoryLine;
}

function printVariableLine(type, element, modifier, attribute, value, description) {
    let line = `| $${type.name}`;
    line += element && element.name ? `__${element.name}` : '';
    line += attribute ? `--${attribute.name}` : '';
    line += modifier ? `---${modifier.name}` : '';
    line += ` | ${value} | ${description} |${EOL}`;
    return line;
}

function sanitizeDescription(description) {
    return !!description ? description.split(separator)
        .map(line => line.trim())
        .join(separator)
        .concat(separator, separator) : null;
}

function sortAdocVariables() {
    let adocTypesArray = adocContent
        .split(/\|\n\n==\s/g)
        .join(`|\n${splitter}== `)
        .split(splitter);

    return adocTypesArray.map(sortAdocVariablesHandler);
}

function sortAdocVariablesHandler(adocTypeSource) {
    let match;

    while ((match = adocVariablesRetriever.exec(adocTypeSource)) !== null) {
        if (match.index === adocVariablesRetriever.lastIndex) {
            adocVariablesRetriever.lastIndex++;
        }
        adocTypeSource = adocTypeSource.replace(match[0], sortAdocVariableBlock(match[0]));
    }

    return adocTypeSource;
}

function sortAdocVariableBlock(sortableString) {
    return sortableString.split(separator).sort().join(separator);
}

function writeAdocContent(content) {
    const trimmedContent = content.trim(),
        typeName = /^==\s(.*)/g.exec(trimmedContent)[1],
        filePath = path.resolve('./', config.docs.target, typeName.concat('.adoc'));

    content = content.replace(adocVariablesRetriever, wrapTableContent);

    fs.ensureFileSync(filePath);
    fs.writeFileSync(filePath, content);
}

function wrapTableContent(content) {
    return `[%header,cols=3]\n|===\n| Name | Value | Descriptions \n${content.replace(/\|\n/g, '\n')}\n|===`;
}

module.exports = writeAdoc;
