import test from 'ava';
import esmock from '../src/esmock.js';
import sinon from 'sinon';

test('should return un-mocked file', async t => {
  const main = await esmock('./local/main.js');
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(main(), `main string, mainUtil=${mainqs}`);
});

test('should mock a local file', async t => {
  const main = await esmock('./local/main.js', {
    './local/mainUtil.js' : {
      createString : () => 'test string'
    }
  });

  t.is(typeof main, 'function');
  t.is(main(), 'main string, test string');
});

test('should mock a module', async t => {
  const main = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode'
  });

  t.is(typeof main, 'function');
  t.is(main.createString(), 'mock encode');
});

test('should mock a module, many times differently', async t => {
  const mainfoo = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode foo'
  });
  const mainbar = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode bar'
  });
  const mainbaz = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : () => 'mock encode baz'
  });
  t.is(typeof mainfoo, 'function');
  t.is(mainfoo.createString(), 'mock encode foo');
  t.is(mainbar.createString(), 'mock encode bar');
  t.is(mainbaz.createString(), 'mock encode baz');
});

test('should return un-mocked file (again)', async t => {
  const main = await esmock('./local/main.js');
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=namedExportOne',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(main(), `main string, mainUtil=${mainqs}`);
});

test('should mock local file', async t => {
  const mainUtil = await esmock('./local/mainUtil.js', {
    './local/mainUtilNamedExports.js' : {
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
  const mainUtil = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : o => JSON.stringify(o),
    './local/mainUtilNamedExports.js' : {
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
  const mainUtil = await esmock('./local/mainUtil.js', {
    'form-urlencoded' : o => JSON.stringify(o),
    './local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar',
      __esModule : true
    }
  });

  t.is(mainUtil.createString(), JSON.stringify({
    mainUtil : 'a string',
    mainUtilNamedExportOneValue : 'foobar',
    mainUtilNamedExportTwoValue : 'namedExportTwo'
  }));
});

test('should work well with sinon', async t => {
  const mainUtil = await esmock('./local/mainUtil.js', {
    './local/mainUtilNamedExports.js' : {
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
  const main = await esmock('./local/usesmjsModule.js', {
    './local/exampleMJS.mjs' : () => 'first mocked'
  });

  t.is(main.verifyImportedMock(), 'first mocked');
});

test('should mock an mjs file, again', async t => {
  const main = await esmock('./local/usesmjsModule.js', {
    './local/exampleMJS.mjs' : () => 'second mocked'
  });

  t.is(main.verifyImportedMock(), 'second mocked');
});
