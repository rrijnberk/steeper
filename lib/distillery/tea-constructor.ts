const { balancer } = require('../support/balancer.ts');
const { TEAMap } = require('../models/tea-map.ts');
const TEATypes = require('../models/tea-types.ts');

const MATCH_CONFIG = {
    ELEMENT: 1,
    ELEMENT_NAME: 2,
    MODIFIER: 1,
    MODIFIER_NAME: 2,
    TYPE: 1,
    TYPE_NAME: 2,

    ATTRIBUTE: 3,
    ATTRIBUTE_NAME: 4,
    ATTRIBUTE_VALUE: 5,
    ATTRIBUTE_DESCRIPTION: 6,

    GROUP_CLOSE: 7
};

class TeaConstructor {
    constructor() {
        this.teaConstruct = {};
        this.types = new TEAMap();
    }

    closeGroup() {
        if(this.teaConstruct.type && !this.teaConstruct.element) {
            this.teaConstruct.type = null;
        }
        if(this.teaConstruct.element && !this.teaConstruct.modifier) {
            this.teaConstruct.element = null;
        }
        if(this.teaConstruct.modifier) {
            this.teaConstruct.modifier = null;
        }
    }

    deconstruct(source) {
        const deconstructionRegex = /(?:(?:(type|element|modifier)\s{1,}([-a-zA-Z0-9]{1,})\s{1,}\{(?:\s|\n){0,})|(?:(attribute)\s{1,}([-a-zA-Z0-9]{0,})\s{0,}:\s{0,}(.*?)(?:\s{0,}:\s{0,})(?:\[\s{0,}(.*?)\s{0,}\]);(?:\n|\s){0,})|(})(?:\n|\s){0,})/gy;
        let match;

        while ((match = deconstructionRegex.exec(source)) !== null) {
            if (match.index === deconstructionRegex.lastIndex) {
                deconstructionRegex.lastIndex++;
            }
            this.delegate(match);
        }
    }

    delegate(match) {
        switch(
            match[MATCH_CONFIG.TYPE] ||
            match[MATCH_CONFIG.ELEMENT] ||
            match[MATCH_CONFIG.ATTRIBUTE] ||
            match[MATCH_CONFIG.GROUP_CLOSE]
        ) {
            case 'type':
                return this.setType.bind(this)(match[MATCH_CONFIG.TYPE_NAME]);
            case 'element':
                return this.setElement.bind(this)(match[MATCH_CONFIG.ELEMENT_NAME]);
            case 'attribute':
                return this.setAttribute.bind(this)(
                    match[MATCH_CONFIG.ATTRIBUTE_NAME],
                    match[MATCH_CONFIG.ATTRIBUTE_VALUE],
                    match[MATCH_CONFIG.ATTRIBUTE_DESCRIPTION]
                );
            case 'modifier':
                return this.setModifier.bind(this)(match[MATCH_CONFIG.MODIFIER_NAME]);
            case '}':
                return this.closeGroup();
            default:
                console.warn(`record '${match}' is not of known type`)
        }
    }

    getMap() {
        let type, element, modifier;
        if(this.teaConstruct.type && this.types.has(this.teaConstruct.type)) {
            type = this.types.getValue(this.teaConstruct.type);
        }
        if(this.teaConstruct.element && type.has(this.teaConstruct.element)) {
            element = type.getValue(this.teaConstruct.element);
        }
        if(this.teaConstruct.modifier && element.has(this.teaConstruct.modifier)) {
            modifier = element.getValue(this.teaConstruct.modifier);
        }
        return modifier || element || type || this.types;
    }

    parse(source) {
        if(balancer.isBalanced(source)) {
            this.deconstruct(source.toString());
        } else {
            console.error('Source is not balanced.');
        }
        return this.types;
    }

    setAttribute(name, value, description) {
        const map = this.getMap();
        map.set({
            type: TEATypes.ATTRIBUTE,
            name
        }, value, description);
    }

    setElement(name) {
        this.updateLocalStorageAndLevel(TEATypes.ELEMENT, name);
    }

    setModifier(name) {
        this.updateLocalStorageAndLevel(TEATypes.MODIFIER, name);
    }

    setType(name) {
        this.updateLocalStorageAndLevel(TEATypes.TYPE, name);
    }

    updateLocalStorageAndLevel(teaType, name) {
        this.teaConstruct[teaType] = {
            type: teaType,
            name
        };
        const map = this.getMap();
        if(!map.has(this.teaConstruct[teaType])) {
            map.set(this.teaConstruct[teaType], new TEAMap());
        }
    }
}

exports.teaConstructor = new TeaConstructor();