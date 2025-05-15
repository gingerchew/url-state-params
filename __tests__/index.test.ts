import { expect, describe, it } from 'vitest';
import { URLStateParams } from '../src/index';


describe('URLStateParams', () => {
    it('should be an instance of URLStateParams', () => {
        expect(new URLStateParams()).instanceOf(URLStateParams)
    });

    it('should be able to set params', () => {
        const state = new URLStateParams();
        state.set('name', 'test');
        expect(state.get('name')).toBe('test');
    });

    it('should revive primitives', () => {
        const state = new URLStateParams();
        const key = 'test';
        state.set(key, true);
        expect(state.get(key)).toBe(true);
        state.set(key, false);
        expect(state.get(key)).toBe(false);
    })
    it('should revive objects', () => {
        const state = new URLStateParams();
        const key = 'test';
        state.set(key, { name: 'John' });
        expect(state.get(key)).toStrictEqual({ name: 'John' });
        state.set(key, ['testing', 123]);
        expect(state.get(key)).toStrictEqual(['testing', 123]);
        // @ts-ignore
        const m = new Map([
            ['name', 'Jane'],
            [123, 456],
            [true, false]
        ])
        state.set(key, m);
        expect(state.get(key)).toStrictEqual(m);
    });
    it('should overwrite when setting', () => {
        const state = new URLStateParams();
        state.set('test', 123);
        state.set('test', 456);
        expect(state.get('test')).toBe(456);
    })
    it('should append to the same key', () => {
        const state = new URLStateParams();
        const key = 'append';

        state.set(key, 'name');
        state.append(key, 123);
        expect(state.get(key)).toStrictEqual(['name', 123]);
    });
    it('should delete keys', () => {
        const state = new URLStateParams();
        const key = 'delete';
        state.set(key, 123);
        expect(state.get(key)).toBe(123);
        state.delete(key);
        expect(state.get(key)).toBe(null);
    })
    it('should implement a getAll method that works if multiple keys exist', () => {
        const state = new URLStateParams();

        const key = 'getAll';
        state.append(key, 123);
        state.append(key, 'test');
        expect(state.getAll(key)).toStrictEqual([123, 'test'])
    });
    it('should return an encoded string', () => {
        const state = new URLStateParams();
        
        state.set('text', 'name');
        state.set('number', 123);
        state.set('object', {});
        state.set('array', []);
        state.set('set', new Set());
        state.set('map', new Map());
        expect(state.toString()).toBe('text=name&number=123&object=%7B%7D&array=%5B%5D&set=%7B%22%24t%22%3A%22Set%22%2C%22%24v%22%3A%5B%5D%7D&map=%7B%22%24t%22%3A%22Map%22%2C%22%24v%22%3A%7B%7D%7D')
    })
    it('should return a readable string', () => {
        const state = new URLStateParams();
        state.set('text', 'name');
        state.set('number', 123);
        state.set('object', {});
        state.set('array', []);
        state.set('set', new Set());
        state.set('map', new Map());
        expect(state.toReadableString()).toBe('text=name&number=123&object={}&array=[]&set={"$t":"Set","$v":[]}&map={"$t":"Map","$v":{}}')
    });

    it('should sort', () => {
        const state = new URLStateParams();
        state.set('z', 123);
        state.set('a', 321);
        expect(state.toReadableString()).toBe('z=123&a=321');
        state.sort();
        expect(state.toReadableString()).toBe('a=321&z=123');
    });

    it('should parse values to string', () => {
        const state = new URLStateParams();
        expect(state._parseValueToString('Map', new Map())).toBe('{"$t":"Map","$v":{}}')
        expect(state._parseValueToString('String', 'test')).toBe('test');
    })

    it('should parse string to values', () => {
        const state = new URLStateParams();
        expect(state._parseStringToValue('String', 'test')).toBe('test');
        expect(state._parseStringToValue('Array', '[123]')).toStrictEqual([123])
        expect(state._parseStringToValue('Set', '[123]')).toStrictEqual(new Set([123]))
    });

    it('should loop with forEach', () => {
        const state = new URLStateParams();

        state.set('a', 1);
        state.set('b', 2);
        state.set('c', 3);
        const keys:string[] = [];
        const values:unknown[] = [];
        state.forEach((value, key) => {
            keys.push(key);
            values.push(value);
        });
        expect(keys).toStrictEqual(['a','b','c']);
        expect(values).toStrictEqual([1,2,3]);
    });
    it('should check if key exists', () => {
        const state = new URLStateParams();
        state.set('a', 1);
        expect(state.has('a')).toBe(true);
        expect(state.has('a', 1)).toBe(true)
        expect(state.has('a', 2)).toBe(false);
        
    })
    it('should create a generator with entries', () => {
        const state = new URLStateParams();
        state.set('a', 1);
        state.set('b', 2);
        state.set('c', 3);
        for (const [key, value] of state.entries()) {
            switch(key) {
                case 'a':
                    expect(value).toBe(1);
                    break;
                case 'b':
                    expect(value).toBe(2);
                    break;
                case 'c':
                    expect(value).toBe(3);
                    break;
                default:
                    throw new Error('Found unusual outcome');
            }
        }
    });
    it('should create a generator with values', () => {
        const state = new URLStateParams();
        state.set('a', 1);
        state.set('b', 2);
        state.set('c', 3);

        expect([...state.values()]).toStrictEqual([1,2,3]);
    });
    it('should create a generator with keys', () => {
        const state = new URLStateParams();
        state.set('a', 1);
        state.set('b', 2);
        state.set('c', 3);
        expect([...state.keys()]).toStrictEqual(['a','b','c']);
    });
    it('should be spreadable', () => {
        const state = new URLStateParams();
        state.set('a', 1);
        state.set('b', 2);
        state.set('c', 3);
        expect([...state]).toStrictEqual([
            ['a',1],
            ['b',2],
            ['c',3]
        ])
    })
});