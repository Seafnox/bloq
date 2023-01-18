const path = require('path');
const { workerData } = require('worker_threads');

require('ts-node').register();
const fileNameParts = __filename.split('.');

fileNameParts[fileNameParts.length - 1] = 'ts';
console.log(__filename, fileNameParts.join('.'));

require(fileNameParts.join('.'));
