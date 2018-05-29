const objectAssignDeep = require(`object-assign-deep`);
const path = require(`path`);

const CONFIG_FILE = 'steeper.conf.json';

const params = resolveParameters();

const defaults = require('../' + CONFIG_FILE);
const overrides = require(path.resolve(`./${params.config}`));

function resolveParameters() {
    const args = process.argv.slice(2);
    let parameters = {
        config: CONFIG_FILE
    };

    for(let index = 0; index < args.length; index++) {
        switch (args[index]) {
            case '-c':
            case '--config':
                parameters.config = args[++index];
                break;
        }
    }
    return parameters;
}

module.exports = objectAssignDeep(defaults, overrides);