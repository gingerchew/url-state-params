import * as utils from '../src/utils';
import { describe, it, expect } from 'vitest';

describe('utils', () => {
    it('should get the right types', () => {
        expect(utils.isArray([])).toBe(true);
        expect(utils.isMap(new Map)).toBe(true);
        expect(utils.hasOwn({ name: 'John' }, 'name')).toBe(true);
        expect(utils.isSet(new Set)).toBe(true);
        expect(utils.isDate(new Date)).toBe(true);
        expect(utils.isRegExp(new RegExp('.'))).toBe(true);
        expect(utils.isFunction(function(){})).toBe(true);
        expect(utils.isString('')).toBe(true);
        expect(utils.isSymbol(Symbol())).toBe(true)
        expect(utils.isPromise(new Promise(res => res(true)))).toBe(true);
        expect(utils.isObject({})).toBe(true);
        expect(utils.objectToString.call({})).toBe('[object Object]');
        expect(utils.toTypeString({})).toBe('[object Object]');
        expect(utils.toRawType({})).toBe('Object');
        expect(utils.isPlainObject({})).toBe(true);
        expect(utils.isPromise(function() {})).toBe(false);
        expect(utils.toNumber(100)).toBe(100);
    });
    it('should convert to number', () => {
        expect(utils.toNumber('0')).toBe(0);
    })
    it('should recognize integer keys', () => {
        expect(utils.isIntegerKey('0')).toBe(true)
    })
})