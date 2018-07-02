const {TEA_TYPES} = require('../models/tea.types.ts');

class TEAObjectIterator {
    constructor() {
        this.nodeHandlers = [];
        this.descriptiveKeys = [
            'description',
            'name',
            'type',
            'value'
        ];
    }

    addNodeHandler(handler) {
        this.nodeHandlers.push(handler);
    }

    condense(json) {
        let result = {};
        this.descriptiveKeys.map(key => (result[key] = json[key]));
        return result;
    }


    generateComposite(old, json) {
        let result = Object.assign({}, old);
        result[json.type] = (result[json.type] || []);
        if(json.type === TEA_TYPES.ATTRIBUTE) {
            result[TEA_TYPES.ATTRIBUTE] = result[TEA_TYPES.ATTRIBUTE].filter(attribute => !attribute.value);
        }
        result[json.type].push(this.condense(json));
        return result;
    }

    iterate(json) {
        Object.keys(json).map(key => this.iterativeIterator(key, json[key], null))
    }

    iterativeIterator(key, json, composition) {
        if (!composition) composition = {};
        const newComposition = this.generateComposite(composition, json);
        const children = Object.keys(json).filter(this.nonDescriptiveKeys.bind(this));
        this.nodeHandlers.map(nodeHandler => nodeHandler(this.condense(json), newComposition));
        children.map(key => this.iterativeIterator(key, json[key], newComposition));
    }

    nonDescriptiveKeys(key) {
        return this.descriptiveKeys.indexOf(key) === -1;
    }





}

exports.TEAObjectIterator = TEAObjectIterator;