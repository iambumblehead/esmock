import request from 'form-urlencoded';
import { basename } from 'path';
import {
  mainUtilNamedExportOne
} from './mainUtilNamedExports.js';
import { readPath, readSync } from './usesCoreModule.js';

import {
  createString,
  causeRuntimeError
} from './mainUtil.js';

if (typeof basename !== 'function') {
  throw new Error('import basename failed');
}

if (typeof request === 'undefined') {
  throw new Error('imported definition: undefined');
};

export const mainDependencyUsingCoreModuleFSReadPath = path => {
  return readPath(path);
};

export const readTemplateFile = path => {
  return readSync(path);
};

export const causeRuntimeErrorFromImportedFile = () => (
  causeRuntimeError());

export default () => {
  return /mocked/.test(mainUtilNamedExportOne)
    ? 'main string and mocked export, ' + createString()
    : 'main string, ' + createString();
};
