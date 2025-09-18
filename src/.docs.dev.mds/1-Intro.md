# 1 Introduction to the build system
The Telsoc website uses `/build.js` as a custom build script. As a result, the input html code must be formatted in a particular way so that the build script works. 

The build script is simple, extendable and powerful. But you must learn how to harness that power.

## 1.1 Understanding how the build script works
The build script in itself is fairly simple. It is invoked with a single argument, the target directory.

```
node build.js <target>
```

It takes every file in the `target`, filters out all folders and files ending in `*.dev.*` (e.g. `secretdata.dev.txt`), and then treats the content of those files as a [Javascript template literal]().

Javascript template literals are strings that are substituted in at run time. Anything inside a `${<value>}` must be a value that Javascript can represent as a string. Think of how `.format()` works in other high level languages, or how `printf` substitutes values with `%`.

Here is an example:

```js
let x = 5;

console.log(`Value: ${x}`);
```

```
>>> Value: 5
```

This is already 99% of how the build script works. The last 1% is then the functions that are provided to you. `include` and `includeTemplate`.

We're going to use an example file, `example.txt`, to demonstrate how these functions work.

```
Hello, ${name} - the time is ${performance.now()}
```

`include(path)` takes a `path` and returns a string representation of whatever file is at that path. 

```js
>>> include("./src/example.txt");
>>> Hello, ${name} - the time is ${performance.now()} ```

`includeTemplate(path, params)` is very similar to `include`, except it treats the file as another template. `params` is a Javascript object that it uses as a local namespace.

```js
>>> includeTemplate("./src/example.txt" { name: "Joe" });
>>> Hello, Joe - the time is 2194.0851760003716
```

## 1.2 Extending the build script

