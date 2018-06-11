const separator = '-';

function condense(composition) {
    return new Condensed(composition);
}

class Condensed {
    constructor(teaJson) {
        this._type = teaJson.type;
        this._element = teaJson.element;
        this._attribute = teaJson.attribute;
        this._modifier = teaJson.modifier;
    }

    get attribute() {
        return this._attribute.map(a => a.name).join(separator);
    }

    get attributeDescription() {
        return this._attribute[this._attribute.length-1].description;
    }

    get element() {
        return this._element ? this._element.map(e => e.name).join(separator) : null;
    }

    get elementDescription() {
        return this._element[this._element.length-1].description;
    }

    get modifier() {
        return this._modifier ? this._modifier.map(m => m.name).join(separator) : null;
    }

    get modifierDescription() {
        return this._modifier[this._modifier.length-1].description;
    }

    get type() {
        return this._type.map(t => t.name).join(separator);
    }

    get typeDescription() {
        return this._type[this._type.length-1].description;
    }
}

module.exports = condense;