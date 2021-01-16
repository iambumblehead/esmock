import {
  esmockAddMocked,
  esmockImportedModuleSanitize
} from './esmockModule.js';

const esmock = async (modulePath, mockDefs = {}) => {
  const modulePathKey = esmockAddMocked(modulePath, mockDefs);
  const [ importedModule ] = await Promise.all([
    import(modulePathKey)
  ]);

  return esmockImportedModuleSanitize(importedModule);
};

export default esmock;
