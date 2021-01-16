import test from 'ava';
import esmock from '../src/esmock.js';

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
  const main = await esmock('./local/main.js', {
    'form-urlencoded' : () => 'mock encode'
  });
  
  t.is(typeof main, 'function');
  t.is(main(), 'main string, mock encode');
});

test('should mock a module, twice differently', async t => {
  const mainfoo = await esmock('./local/main.js', {
    'form-urlencoded' : () => 'mock encode foo'
  });
  const mainbar = await esmock('./local/main.js', {
    'form-urlencoded' : () => 'mock encode bar'
  });
  const mainbaz = await esmock('./local/main.js', {
    'form-urlencoded' : () => 'mock encode baz'
  });
  
  t.is(typeof mainfoo, 'function');
  t.is(mainfoo(), 'main string, mock encode foo');
  t.is(mainbar(), 'main string, mock encode bar');
  t.is(mainbaz(), 'main string, mock encode baz');
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
  const main = await esmock('./local/main.js', {
    './local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar'
    }
  });
  const mainqs = [
    'a+string',
    'mainUtilNamedExportOneValue=foobar',
    'mainUtilNamedExportTwoValue=namedExportTwo'
  ].join('&');

  t.is(main(), `main string, mainUtil=${mainqs}`);
});

test('should mock module and local file at the same time', async t => {
  const main = await esmock('./local/main.js', {
    'form-urlencoded' : o => JSON.stringify(o),
    './local/mainUtilNamedExports.js' : {
      mainUtilNamedExportOne : () => 'foobar'
    }
  });

  t.is(main(), 'main string, ' + JSON.stringify({
    mainUtil : 'a string',
    mainUtilNamedExportOneValue : 'foobar',
    mainUtilNamedExportTwoValue : 'namedExportTwo'
  }));
});
