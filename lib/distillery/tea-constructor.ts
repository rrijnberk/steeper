const { balancer } = require('../support/balancer.ts');
const { TEAMap } = require('../models/tea-map.ts');
const TEATypes = require('../models/tea-types.ts');

const MATCH_CONFIG = {
    ELEMENT: 1,
    ELEMENT_NAME: 2,
    ELEMENT_DESCRIPTION: 3,
    MODIFIER: 1,
    MODIFIER_NAME: 2,
    MODIFIER_DESCRIPTION: 3,
    TYPE: 1,
    TYPE_NAME: 2,
    TYPE_DESCRIPTION: 3,

    ATTRIBUTE: 4,
    ATTRIBUTE_NAME: 5,
    ATTRIBUTE_VALUE: 6,
    ATTRIBUTE_DESCRIPTION: 7,

    GROUP_CLOSE: 8
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
        const deconstructionRegex = /(?:(?:(type|element|modifier)\s{1,}([-a-zA-Z0-9]{1,})(?:\s{1,}\[(?:\s|\n){0,}((?:.|\n)*?)(?:\s|\n){0,}\]){0,}\s{1,}\{(?:\s|\n){0,})|(?:(attribute)\s{1,}([-a-zA-Z0-9]{0,})\s{0,}:\s{0,}(.*?)(?:\s{0,}:\s{0,})(?:\[\s{0,}(.*?)\s{0,}\]);(?:\n|\s){0,})|(})(?:\n|\s){0,})/gy;
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
                return this.setType.bind(this)(match[MATCH_CONFIG.TYPE_NAME], match[MATCH_CONFIG.TYPE_DESCRIPTION]);
            case 'element':
                return this.setElement.bind(this)(match[MATCH_CONFIG.ELEMENT_NAME], match[MATCH_CONFIG.ELEMENT_DESCRIPTION]);
            case 'attribute':
                return this.setAttribute.bind(this)(
                    match[MATCH_CONFIG.ATTRIBUTE_NAME],
                    match[MATCH_CONFIG.ATTRIBUTE_VALUE],
                    match[MATCH_CONFIG.ATTRIBUTE_DESCRIPTION]
                );
            case 'modifier':
                return this.setModifier.bind(this)(match[MATCH_CONFIG.MODIFIER_NAME], match[MATCH_CONFIG.MODIFIER_DESCRIPTION]);
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
        const map = this.getMap(),
            key = {
                type: TEATypes.ATTRIBUTE,
                name
            };
        map.set(key, value, description);
    }

    setElement(name, description) {
        this.updateLocalStorageAndLevel(TEATypes.ELEMENT, name, description);
    }

    setModifier(name, description) {
        this.updateLocalStorageAndLevel(TEATypes.MODIFIER, name, description);
    }

    setType(name, description) {
        this.updateLocalStorageAndLevel(TEATypes.TYPE, name, description);
    }

    updateLocalStorageAndLevel(teaType, name, description = '') {
        this.teaConstruct[teaType] = {
            type: teaType,
            name
        };
        const map = this.getMap();
        if(!map.has(this.teaConstruct[teaType])) {
            map.set(this.teaConstruct[teaType], new TEAMap(), description);
        }
    }
}

exports.teaConstructor = new TeaConstructor();