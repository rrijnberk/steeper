const attributeResolver = /attribute\s+(.*)\s*:\s*(.*?)\s*:\s*\[\s*(.*?)\s*\];/g;
const groupResolver =/(type|element|attribute|modifier)\s+(.*?)\s+(?:\[\s*((?:.|\n|\s)*?)\s*\]\s*)*{/g;
const separationResolver = /}(?!(\s|\n)*(}|$))/g;

const separationJSONConstructor = '},';

function parseTEASource(source) {
    let result = source
        .replace(attributeResolver, attributeJSONConstructor)
        .replace(groupResolver, groupJSONConstructor)
        .replace(separationResolver, separationJSONConstructor);

    return JSON.parse(`{ ${result} }`);
}

function attributeJSONConstructor(full, name, value, description) {
    return `"${guid()}": { "description": "${description}", "name": "${name}", "type": "attribute", "value": "${value}" }`;
}

function groupJSONConstructor(full, type, name, description) {
    return `"${guid()}": { "description": "${(description || '').replace(/\n/g, '\\n')}",` +
        ` "name": "${name}", "type": "${type}", `;
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

exports.parseTEASource = parseTEASource;