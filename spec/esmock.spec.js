import test from 'ava';
import esmock from '../src/esmock.js';

test('should pass a test', t => t.is(typeof esmock, 'string'));
