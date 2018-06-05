const {TEA_TYPES} = require('../models/tea.types.ts');

const condense = require('../support/condense.function.ts');
const config = require('../platform/config.ts');
const fs = require('fs-extra');
const generateVariable = require('../support/generateVariable.function.ts');
const path = require('path');

class AdocWriter {
    constructor() {
        this.types = {};
    }

    addNode(json, composition) {
        if (json.type === TEA_TYPES.ATTRIBUTE && json.value) {
            const condensed = condense(composition);
            let target;

            target = this.types[condensed.type] = this.types[condensed.type] || {
                name: condensed.type,
                description: condensed.typeDescription,
                type: TEA_TYPES.TYPE
            };

            if (condensed.element) {
                target.elements = target.elements || {};
                target = target.elements[condensed.element] = target.elements[condensed.element] || {
                    name: condensed.element,
                    description: condensed.elementDescription
                }
            }

            if (condensed.modifier) {
                target.modifiers = target.modifiers || {};
                target = target.modifiers[condensed.modifier] = target.modifiers[condensed.modifier] || {
                    name: condensed.modifier,
                    description: condensed.modifierDescription
                }
            }

            target.attributes = target.attributes || {};
            target.attributes[json.name] = json;
            target.attributes[json.name].varName = generateVariable(condensed);
        }
    }

    write() {
        Object.keys(this.types)
            .map(key => this.printBlock(this.types[key], '=='))
            .map(fileDescriptor => {
                const targetFile = path.resolve('./', config.docs.target, fileDescriptor.name + '.adoc');
                fs.ensureFileSync(targetFile);
                fs.writeFileSync(targetFile, fileDescriptor.content);
            });
    }

    printAttributeList(keys, attributes) {
        let list = `[%header,cols=3]\n|===\n| Name | Value | Descriptions\n`;
        keys.map(key => {
            list += `| ${attributes[key].varName} | ${attributes[key].value} | ${attributes[key].description}\n`
        });
        return list.concat('|===\n\n');
    }

    printBlock(object, level) {
        let result = `${level} ${object.name}\n${object.description}\n\n`,
            attributeKeys, elementKeys, modifierKeys;
        if(object.attributes && (attributeKeys = Object.keys(object.attributes)).length) {
            result += this.printAttributeList(attributeKeys, object.attributes);
        }
        if (object.modifiers && (modifierKeys = Object.keys(object.modifiers)).length) {
            result += Object
                .keys(object.modifiers)
                .map(key => this.printBlock(object.modifiers[key], level.concat('=')))
                .join('\n\n');
        }
        if (object.elements && (elementKeys = Object.keys(object.elements)).length) {
            result += Object
                .keys(object.elements)
                .map(key => this.printBlock(object.elements[key], level.concat('=')))
                .join('\n\n');
        }
        return object.type === TEA_TYPES.TYPE ? {name: object.name, content: result} : result;
    }
}



function count(posArray) {
    return posArray && Object.keys(posArray).length ? Object.keys(posArray).length : 0;
}

exports.AdocWriter = AdocWriter;