import { toNumber, toRawType, $S, $P, separator } from './utils';
import type { TrueTypes } from './utils';

type ParsedTypeFromType<Type extends TrueTypes> = Type extends 'Set' ? unknown[]
    : Type extends 'Map' ?
    Record<string, string>
    : string;

type ValueFromType<Type extends TrueTypes> = Type extends 'Set' ? Set<unknown>
    : Type extends 'Map' ?
    Map<unknown, unknown>
    : Type extends 'Array' ?
    unknown[]
    : Type extends 'Object' ?
    Record<string, string | boolean | number | object>
    : unknown;

type RevivableObject<Type extends TrueTypes> = {
    $t: Type;
    $v: ParsedTypeFromType<Type>
}


type ForEachCallback = (value: unknown, key: string, parent: URLStateParams) => void;

export class URLStateParams {
    #$ = new URLSearchParams();
    _parseValueToString(type: TrueTypes, value: ValueFromType<typeof type>): string {
        if (type === 'Array' || type === 'Object') {
            return $S(value);
        }
        if (type === 'Set') {
            return $S({
                $t: type,
                $v: [...(value as Set<unknown>).values()]
            })
        }
        if (type === 'Map') {
            return $S({
                $t: type,
                $v: (value as Map<unknown, unknown>).size > 0 ? [...(value as Map<unknown, unknown>).entries()].reduce((acc, [key, value]) => {
                    acc[this._safeValue(key)] = this._safeValue(value);
                    return acc
                }, {} as Record<string, string>) : {}
            })
        }

        // If all else fails, coerce to string
        import.meta.env.DEV && console.warn('No parser set up for type: ' + type);
        return '' + value;
    }
    _parseStringToValue(type: TrueTypes, object: RevivableObject<typeof type>['$v']) {
        let output;
        if (type === 'Set') {
            output = new Set($P(object as string) as Iterable<unknown>);
        }
        if (type === 'Map') {
            output = new Map(Object.entries(object as RevivableObject<'Map'>['$v'])
                .map(([key, value]) => [
                    this._parse(key),
                    this._parse(value)
                ])
            );
        }
        import.meta.env.DEV && console.warn('No reviver set up for type: ' + type)
        if (!output) {
            try {
                output = $P(object as string);
            } catch (e) {
                output = object;
            }
        }
        return output;
    }
    _safeValue = (value: unknown): string => !['string', 'boolean', 'number'].includes(typeof value) ?
        this._parseValueToString(toRawType(value) as TrueTypes, value) :
        '' + value;
    /**
     * Reformats urlparams data into the proper type
     * Only works for individual items
     * 
     * &key=123 => 123 as a number
     * &key=123|true|{"user":0} => "123|true|{"user":0}"
    */
    _decode(str: string | null) {
        if (!str) return str;
        if (['true', 'false'].includes(str)) {
            return str === 'true';
        }

        let output = toNumber(str);
        if (toRawType(output) === 'Number' && output === output) return output;

        try {
            output = $P(str);

            if ('$t' in output && '$v' in output) {
                output = this._parseStringToValue(output.$t, output.$v);
                console.log({ output });
            }
        } catch (e) {
            output = str;
        }
        return output;
    }
    /**
     * Takes a value from the urlparams and converts it
     * to its original value type
     * 
     * This includes handling keys with multiple values
     * 
     * @NOTE: This function is passing tests, but test may need to be expanded as something doesn't feel right here
    */
    _parse(value: string | null): any {
        const decoded = this._decode(value);

        if (typeof decoded === 'string') {
            return decoded.indexOf(separator) > -1 ? (decoded as string).split(separator).map(v => this._parse(v)) : this._decode(value);
        }

        return decoded
    }
    append(key: string, value: unknown) {
        const safe = this._safeValue(value);
        if (this.#$.has(key)) {
            this.#$.set(key, `${this.#$.get(key)}|${safe}`);
        } else {
            this.#$.append(key, safe);
        }
    }
    get = (
        key: string
    ) => this._parse(this.#$.get(key));
    // Even though append will append to a single key
    // urlSearchParams offers a getAll method
    // We recreate it here in a way that returns all the values as a single array
    getAll = (
        key: string
    ): any[] => this.#$.getAll(key).flatMap(value => this._parse(value))
    set(key: string, value: unknown) {
        this.#$.set(key, this._safeValue(value));
    }
    sort() {
        this.#$.sort();
    }
    toString = () =>
    (
        import.meta.env.DEV &&
        console.warn('toString might return a hard to parse value as it is all urlEncoded, for human readable strings use toReadableString.'),
        this.#$.toString()
    )
    toReadableString() {
        let output = '';
        for (const [key, value] of this.#$.entries()) {
            let _tmp;
            // Check if it is parsable by JSON
            try {
                _tmp = $P(value)
            } catch (e) {
                // fallback to original value
                _tmp = value;
            }

            if (toRawType(_tmp) === 'Object' && '$t' in _tmp && '$v' in _tmp) {
                _tmp = this._parseValueToString(_tmp.$t, _tmp.$v)
            }
            output += `${output.length === 0 ? '' : '&'}${key}=${this._safeValue(_tmp)}`
        }
        return output;
    }
    forEach(callback: ForEachCallback, thisArg = this) {
        this.#$.forEach((value, key) => callback.call(thisArg, this._parse(value), key, this))
    }
    delete(key: string) {
        this.#$.delete(key);
    }
    has = (key: string, value?: unknown) => this.#$.has(key) && value !== undefined ?
        this.#$.has(key, this._safeValue(value)) :
        this.#$.has(key);
    *entries() {
        for (const [key, value] of this.#$.entries()) {
            yield [key, this._parse(value)]
        }
    }
    *values() {
        for (const value of this.#$.values()) {
            yield this._parse(value);
        }
    }
    *keys() {
        for (const key of this.#$.keys()) yield key;
    }
    *[Symbol.iterator]() {
        for (const entry of this.entries()) {
            yield entry;
        }
    }
}