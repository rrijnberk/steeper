#! /usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

const {
    resolveFiles,
    resolveSources
} = require('./platform/reader.ts');

const {
    parseTEASource
} = require('./platform/tea.parser.ts');

const {
    filesArrayPromiseHandler,
    objectArrayPromisesHandler,
    objectPromisesHandler,
    sourceArrayPromiseHandler
} = require('./platform/promise.handlers.ts');

const { AdocWriter } = require('./output/adoc.writer.ts');
const { SassWriter } = require('./output/sass.writer.ts');
const { TEAObjectIterator } = require('./platform/tea.object.iterator.ts');

const sourcePromises = resolveFiles()
    .map(filesArrayPromiseHandler(resolveSources))
    .map(sourceArrayPromiseHandler(parseTEASource));

function handleJsonToOutput(json) {
    const teaObjectIterator = new TEAObjectIterator();
    const sassWriter = new SassWriter();
    const adocWriter = new AdocWriter();

    teaObjectIterator.addNodeHandler(sassWriter.addLine.bind(sassWriter));
    teaObjectIterator.addNodeHandler(adocWriter.addNode.bind(adocWriter));

    teaObjectIterator.iterate(json);


    sassWriter.write();
    adocWriter.write();
}

Promise.all(sourcePromises)
    .then(objectArrayPromisesHandler)
    .then(objectPromisesHandler)
    .then(handleJsonToOutput);

