const hash = require('object-hash');

class TEAMapItem {
    constructor(value, description) {
        this.description = description;
        this.value = value;
    }
}

exports.TEAMap = class TEAMap {
    constructor() {
        this.keys = new Map();
        this.storage = new Map();
    }

    delete(key) {
        const hashKey = hash(key);
        this.keys.delete(hashKey);
        this.storage.delete(hashKey);
    }

    map(callback) {
        return Array.from(this.keys.values()).map(key => {
            callback(key, this.get(key));
        });
    }

    get(key) {
        return this.storage.get(hash(key))
    }

    getValue(key) {
        return (this.storage.get(hash(key)) || {}).value;
    }

    getDescription(key) {
        return (this.storage.get(hash(key)) || {}).description;
    }

    has(key) {
        return this.keys.has(hash(key));
    }

    set(key, value, description = '') {
        const hashKey = hash(key),
            newValue = new TEAMapItem(value, description);
        if (this.keys.has(hashKey)) {
            this.duplicateValueMessage(key, this.get(key), newValue);
        }
        this.keys.set(hashKey, key);
        this.storage.set(hashKey, newValue);
    }

    duplicateValueMessage(key, oldVal, newVal) {
        console.warn('\x1b[33m%s\x1b[0m', `There already was a value '` +
            oldVal.value + `' with description '` + oldVal.description +
            `' stored for ${key.type} ${key.name}; replacing this with value '` +
            newVal.value + `' with description '` + newVal.description + `'.`);
    }
};