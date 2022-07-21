import scheduleFunction from './exampleMJS.mjs';
import { TESTCONSTANT } from './env.js';

export function verifyImportedMock () {
  return scheduleFunction();
}

export function verifyImportedConstant () {
  return TESTCONSTANT;
}
