# URLStateParams

> URLSearchParams but for different types of data

The API is similar to urlSearchParams

## Differences

URLSearchParams only accept strings for values, anything not a string will be coerced into a string. URLStateParams accepts objects as well. This is possible by using `JSON.stringify` to convert them to a string first. More complex objects, like Map and Set, are revived internally. This likely isn't as useful if you are using non-primitives as keys, since the objects will be recreated and not be the same object as was saved to the StateParams.

```js
const userKey = { uuid: '' };

state.set('userData', new Map(userKey, { name: 'Jill', age: 34 }));
const userData = state.get('userData');

userData.get(userKey) // undefined
```

`append(name, value)` in URLSearchParams can create multiple keys.

In URLStateParams, `append(name, value)` will add multiple values onto the original key if it is already set. If it hasn't been set, it will set the key first.

```js
// &name=John
params.append('name', 'Jane') // &name=John&name=Jane
state.append('name', 'Jane') // &name=John|Jane
```

In URLSearchParams, `getAll('name')` will take search parameters and return an array of all the values with the given key

```js
// &name=John&name=Jane&name=Joan
state.getAll('name') // ['John', 'Jane', 'Joan']
```

URLSearchParams has a `toString` method that, when using stringified JSON, is very hard to read as it is all url encoded. URLStateParams has a `toReadableString` method that parses the values without encoding.

All other methods, including iterators, are implemented as close as I could test to match URLSearchParams.

### Why would I use this?

Honestly... I don't know. This was more about proving I could figure it out than providing something incredibly useful to the community.

### I found a bug! It should work like-

Now hang on there, I'm more than happy to look at your issue, but please keep in mind this is barely even a pet project. Please keep that in mind :)