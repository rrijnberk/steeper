function generateVariable(condensed) {
    return `$${condensed.type.trim()}` + (condensed.element ? '__' + condensed.element.trim() : '') +
        ('--' + condensed.attribute.trim()) + (condensed.modifier ? '---' + condensed.modifier.trim() : '');
}

module.exports = generateVariable;