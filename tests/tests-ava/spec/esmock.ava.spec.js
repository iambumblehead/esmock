import test from 'ava';
import esmock from 'esmock';
import sinon from 'sinon';

test.only('should something', async t => {
  const mockedIndex = await esmock.px('../../src/classNotAConstructor.js', {
    '../../local/notific.js' : await esmock.px('../../local/notific.js', {
      '@aws-sdk/client-sns' : {
        SNSClient : class {
          send (cmd) {
            return cmd;
          }
        }
      }
    })
  });

  t.true(true);
  console.log(mockedIndex.callNotifier());
});

test('should return un-mocked file', async t => {
  const main = await esmock('../../local/main.js');
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(main(), `main string, mainUtil=${mainqs}`);
});

test('should mock a local file', async t => {
  const main = await esmock.px('../../local/main.js', {
    '../../local/mainUtil.js' : {
      createString : () => 'test string'
    }
  });

  t.is(typeof main, 'function');
  t.is(main(), 'main string, test string');
});

test.serial('should throw error if !esmockloader', async t => {
  global.esmockloader = false;
  await t.throwsAsync(() => esmock('./to/module.js'), {
    message : 'process must be started with --loader=esmock'
  });
  global.esmockloader = true;
});

test('should throw error if local file not found', async t => {
  const err = await t.throwsAsync(() => esmock('../../local/not/found.js', {
    '../../local/mainUtil.js' : {
      createString : () => 'test string'
    }
  }), {
    instanceOf : Error,
    name : 'Error'
  });

  t.true(err.message.startsWith(
    'modulePath not found: "../../local/not/found.js"'));
});

test('should throw error if local definition file not found', async t => {
  const err = await t.throwsAsync(() => esmock('../../local/not/found.js', {
    '../../local/not/found.js' : {
      createString : () => 'test string'
    }
  }), {
    instanceOf : Error,
    name : 'Error'
  });

  t.true(err.message.startsWith(
    'not a valid path: "../../local/not/found.js"'));
});

test('should mock a module', async t => {
  const main = await esmock('../../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode'
  });

  t.is(typeof main, 'function');
  t.is(main.createString(), 'mock encode');
});

test('should mock a module, globally', async t => {
  const main = await esmock('../../local/main.js', {
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : 'mocked'
    }
  }, {
    'form-urlencoded' : () => 'mock encode',
    fs : {
      existsSync : () => true,
      readFileSync : filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  });

  t.is(typeof main, 'function');
  t.is(
    main.mainDependencyUsingCoreModuleFSReadPath('checkfilepath.js'),
    'success'
  );
  t.is(main(), 'main string and mocked export, mock encode');
});

test('should purge local and global mocks', async t => {
  await esmock('../../local/main.js', {
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : 'mocked'
    }
  }, {
    'form-urlencoded' : () => 'mock encode',
    fs : {
      existsSync : () => true,
      readFileSync : filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  }, {
    key : 999
  });

  const keys = Object
    .keys(esmock.esmockCache.mockDefs)
    .filter(key => /esmockKey=999/.test(key));

  t.truthy(keys.length);
  t.true(keys.every(key => esmock.esmockCache.mockDefs[key] === null));
});

test('should mock a module, many times differently', async t => {
  const mainfoo = await esmock('../../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode foo'
  });
  const mainbar = await esmock('../../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode bar'
  });
  const mainbaz = await esmock('../../local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode baz'
  });
  t.is(typeof mainfoo, 'function');
  t.is(mainfoo.createString(), 'mock encode foo');
  t.is(mainbar.createString(), 'mock encode bar');
  t.is(mainbaz.createString(), 'mock encode baz');
});

test('should return un-mocked file (again)', async t => {
  const main = await esmock('../../local/main.js');
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(main(), `main string, mainUtil=${mainqs}`);
});

test('should mock local file', async t => {
  const mainUtil = await esmock.px('../../local/mainUtil.js', {
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar'
    }
  });

  const mainqs = [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(mainUtil.createString(), mainqs);
});

test('should mock module and local file at the same time', async t => {
  const mainUtil = await esmock.px('../../local/mainUtil.js', {
    'form-urlencoded' : o => JSON.stringify(o),
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar'
    }
  });

  t.is(mainUtil.createString(), JSON.stringify({
    mainUtil : 'a string',
    mainUtilNamedExportOneValue : 'foobar',
    mainUtilNamedExportTwoValue : 'namedExportTwo'
  }));
});

test('__esModule definition, inconsequential', async t => {
  const mainUtil = await esmock.px('../../local/mainUtil.js', {
    'babelGeneratedDoubleDefault' : o => o,
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar',
      __esModule : true
    }
  });

  t.is(mainUtil.callBabelGeneratedDoubleDefault('mocked'), 'mocked');
});

test('should work well with sinon', async t => {
  const mainUtil = await esmock.px('../../local/mainUtil.js', {
    '../../local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : sinon.stub().returns('foobar')
    }
  });

  t.is(mainUtil.createString(), [
    'mainUtil=a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&'));
});

test('should mock an mjs file', async t => {
  const main = await esmock('../../local/usesmjsModule.js', {
    '../../local/exampleMJS.mjs' : () => 'first mocked'
  });

  t.is(main.verifyImportedMock(), 'first mocked');
});

test('should mock an mjs file, again', async t => {
  const main = await esmock('../../local/usesmjsModule.js', {
    '../../local/exampleMJS.mjs' : () => 'second mocked'
  });

  t.is(main.verifyImportedMock(), 'second mocked');
});

test('should mock an exported constant values', async t => {
  const main = await esmock('../../local/usesmjsModule.js', {
    '../../local/env.js' : {
      TESTCONSTANT : 'hello world'
    }
  });

  t.is(main.verifyImportedConstant(), 'hello world');
});

test('should mock core module', async t => {
  const usesCoreModule = await esmock('../../local/usesCoreModule.js', {
    fs : {
      existsSync : () => true,
      readFileSync : filepath => filepath === 'checkfilepath.js'
        ? 'success'
        : filepath
    }
  });

  t.is(usesCoreModule.readPath('checkfilepath.js'), 'success');
});

test('should apply third parameter "global" definitions', async t => {
  const main = await esmock.px('../../local/main.js', {
    '../../local/mainUtil.js' : {
      exportedFunction : () => 'foobar'
    }
  }, {
    fs : {
      readFileSync : () => {
        return 'this value anywhere the instance imports fs, global';
      }
    }
  });

  const tplStr = main.readTemplateFile();
  t.is(tplStr, 'this value anywhere the instance imports fs, global');
});

test('returns spread-imported [object Module] default export', async t => {
  const main = await esmock('../../local/usesObjectModule.js', {
    fs : {
      exportedFunction : () => 'foobar'
    }
  });

  t.is(main.exportedFunction(), 'foobar');
});

test('mocks inline `async import("name")`', async t => {
  const writeJSConfigFile = await esmock.p('../../local/usesInlineImport.mjs', {
    eslint : {
      ESLint : function (...o) {
        this.stringify = () => JSON.stringify(...o);

        return this;
      }
    }
  });

  t.is(
    (await writeJSConfigFile('config', 'filePath')).stringify(),
    JSON.stringify({
      baseConfig : 'config',
      fix : true,
      useEslintrc : false,
      filePath : 'filePath'
    }));

  const [ , key ] = writeJSConfigFile.esmockKey.match(/esmk=(\d*)/);
  const keyRe = new RegExp(`esmockKey=${key}[^d]`);

  const moduleKeys = Object.keys(esmock.esmockCache.mockDefs)
    .filter(moduleKey => keyRe.test(moduleKey));

  t.true(moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey]));
  esmock.purge(writeJSConfigFile);
  t.true(moduleKeys.every(mkey => esmock.esmockCache.mockDefs[mkey] === null));
});

test('should have small querystring in stacktrace filename', async t => {
  const { causeRuntimeError } = await esmock('../../local/mainUtil.js');

  try {
    causeRuntimeError();
  } catch (e) {
    t.true(/\?esmk=\d/.test(e.stack.split('\n')[1]));
  }

  t.pass();
});

test('should have small querystring in stacktrace filename, deep', async t => {
  const {
    causeRuntimeErrorFromImportedFile
  } = await esmock.px('../../local/main.js', {}, {
    '../../local/mainUtil.js' : {
      causeRuntimeError : () => {
        t.nonexistantmethod();
      }
    }
  });

  try {
    causeRuntimeErrorFromImportedFile();
  } catch (e) {
    t.true(
      e.stack.split('\n')
        .every(line => !line.includes('?') || /\?esmk=\d/.test(line)));
  }

  t.pass();
});

test('should have small querystring in stacktrace filename, deep2', async t => {
  const causeDeepErrorParent =
    await esmock.px('../../local/causeDeepErrorParent.js', {}, {
      '../../local/causeDeepErrorGrandChild.js' : {
        what : 'now'
      }
    });

  try {
    causeDeepErrorParent();
  } catch (e) {
    // newer versions auto-strip querystring from subsequent paths
    if (' 18.  2' < process.versions.node.split('.')
      .slice(0, 2).map(s => s.padStart(3)).join('.')) {
      t.true(
        e.stack.split('\n')
          .every(line => !line.includes('?') || /\?esmk=\d/.test(line)));
    }
  }

  t.pass();
});

test('should merge "default" value, when safe', async t => {
  const main = await esmock('../../local/main.js');

  t.is(main(), main.default());

  const mockMainA = await esmock('../../local/exportsMain.js', {
    '../../local/main.js' : () => 'mocked main'
  });
  const mockMainB = await esmock('../../local/exportsMain.js', {
    '../../local/main.js' : { default : () => 'mocked main' }
  });

  t.is(mockMainA(), mockMainB());
});

test('should not error when mocked file has space in path', async t => {
  const main = await esmock('../../local/main.js', {
    '../../local/space in path/wild-file.js' : {
      default : 'tamed'
    }
  });

  t.is(main.wild, 'tamed');
});
