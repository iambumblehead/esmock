import formurlencoded from 'form-urlencoded';
import babelGeneratedDoubleDefault from 'babelGeneratedDoubleDefault';
import {
  mainUtilNamedExportOne,
  mainUtilNamedExportTwo
} from './mainUtilNamedExports.js';

const mainUtil = () => 'mainUtil';

const createString = () => formurlencoded({
  mainUtil : 'a string',
  mainUtilNamedExportOneValue : mainUtilNamedExportOne(),
  mainUtilNamedExportTwoValue : mainUtilNamedExportTwo()
});

const callBabelGeneratedDoubleDefault = o => (
  babelGeneratedDoubleDefault.default(o) );

const causeRuntimeError = () => mainUtil()();

export default mainUtil;

export {
  mainUtil,
  createString,
  causeRuntimeError,
  callBabelGeneratedDoubleDefault
};
