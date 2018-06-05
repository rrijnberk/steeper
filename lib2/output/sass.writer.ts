const {TEA_TYPES} = require('../models/tea.types.ts');

const condense = require('../support/condense.function.ts');
const config = require('../platform/config.ts');
const fs = require('fs-extra');
const generateVariable = require('../support/generateVariable.function.ts');
const path = require('path');

const destination = path.resolve('./', config.target.dir);
const extension = `.${config.target.postfix ? config.target.postfix.concat('.') : ''}scss`;

class SassWriter {
    constructor() {
        this.types = {};
    }

    addLine(json, composition) {
        if (json.type === TEA_TYPES.ATTRIBUTE && json.value) {
            const condensed = condense(composition);
            this.types[condensed.type.trim()] = this.types[condensed.type.trim()] || [];
            this.types[condensed.type.trim()].push(generateVariable(condensed) + `: ${json.value};`);
        }
    }

    write() {
        const targetFile = path.resolve(destination, `variables${extension}`);
        let result = '';
        Object.keys(this.types)
            .map(this.writeTypeFile.bind(this))
            .map(file => result += `@import '${file}';\n`);

        fs.ensureFileSync(targetFile);
        fs.writeFileSync(targetFile, result);
    }

    writeTypeFile(type) {
        const targetFile = path.resolve(destination, `_${type}${extension}`);
        fs.ensureFileSync(targetFile);
        fs.writeFileSync(targetFile, this.types[type].join('\n'));
        return `_${type}${extension}`
            .replace(/^_/, '')
            .replace(/\.scss$/, '');
    }
}

exports.SassWriter = SassWriter;