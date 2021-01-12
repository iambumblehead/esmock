import module from 'module';

const esmockModuleStore = {};

const esmockModuleLoadNative = module._load;

module._load = (path, context, ...args ) => {
  /*
  console.log({
    path,
    // context: Object.keys( context ),
    contextId: context.id,
    contextParent: context.parent
  })
  */
  return esmockModuleLoadNative( path, context, ...args );
}

const esmockModuleStoreSet = () => {};

export {
  esmockModuleStoreSet
}
