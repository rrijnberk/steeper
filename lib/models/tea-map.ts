exports.TEAMap = class TEAMap {
    constructor() {
        this.descriptionsMap = new Map();
        this.valueMap = new Map();
    }

    delete(name) {
        this.descriptionsMap.delete(name);
        this.valueMap.delete(name);
    }

    map(callback) {
        return Array.from(this.valueMap.keys()).map(key => {
            callback(key, this.get(key));
        });
    }

    get(key) {
        return {
            description: this.getDescription(key),
            value: this.getValue(key)
        }
    }

    getValue(key) {
        return this.valueMap.get(key);
    }

    getDescription(key) {
        return this.valueMap.has(key) ? this.valueMap.get(key) : '';
    }

    has(key) {
        return this.valueMap.has(key);
    }

    set(key, value, description = '') {
        this.descriptionsMap.set(key, description);
        this.valueMap.set(key, value);
    }
};