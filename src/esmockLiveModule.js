const isPlainObject = o => Boolean(
  Object.prototype.toString.call(o) === '[object Object]'
    && o.constructor && o.constructor.name === 'Object');

const esmockLiveModuleDetached = liveModuleInst => {
  const liveModuleIsDefault = 'default' in liveModuleInst;
  const detachedModule = Object.assign({}, liveModuleInst);

  if (liveModuleIsDefault) {
    if (!isPlainObject(liveModuleInst)) {
      detachedModule.default = Object.assign({}, liveModuleInst.default);
    } else {
      detachedModule.default = liveModuleInst.default;
    }
  }

  return detachedModule;
};

// tries to handle es6's 'default' boilerplate seamlessly
// no fail proof solution for doing this -- :)
const esmockLiveModuleApply = (liveModuleInst, liveModuleDetached, mockDef) => {
  const liveModuleDetachedKeys = Object.keys(liveModuleDetached);
  const liveModuleDetachedIsDefault = 'default' in liveModuleDetached;

  if ('__esModule' in mockDef)
    delete mockDef.__esModule;

  // redefine rather than mutate values on liveModuleInst
  liveModuleInst = Object.keys(liveModuleInst).reduce((inst, key) => {
    inst[key] = null;
    inst[key] = key in mockDef
      ? mockDef[key]
      : liveModuleDetached[key];

    return inst;
  }, liveModuleInst);

  if (!liveModuleDetachedIsDefault)
    return liveModuleInst;

  if (liveModuleDetachedKeys.length === 1) {
    liveModuleInst.default = mockDef;

    return liveModuleInst;
  }

  if (!isPlainObject(mockDef)) {
    liveModuleInst.default = mockDef;

    return liveModuleInst;
  }

  // if live module default and mockdef are both object
  // copy mockdef onto default if corresponding values found there
  if (Object.keys(mockDef).every(key => key in liveModuleDetached.default)) {
    liveModuleInst.default = Object.assign(
      {}, liveModuleDetached.default, mockDef);

    return liveModuleInst;
  }

  return liveModuleInst;
};

export {
  esmockLiveModuleDetached,
  esmockLiveModuleApply
};
