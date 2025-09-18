# Introduction to the build system
The Telsoc website has a custom build script that makes writing HTML a little easier.

## Using the build script
From the command line you can run the build script like this

```
website/$ node build.js <TARGET>
```

Where `<TARGET>` is your source files. 

The build script copies `<TARGET>` to a new directory, `/build`.

## `*.html` and `*.rss` files
`*.html` and `*.rss` files undergo preprocessing. They are treated as Javascript template literals, meaning any content within `${}` will be replaced with a value.

Here is an example:

```js
const x = 5;
console.log(`Value: ${x}`);
```

```
>>> Value: 5
```

As you can see, the `${x}` was substituted with `x`'s value (in this case, 5).

### Built in helper-functions
There are two functions that have been made to aid web development. These are `include` and `includeTemplate`.

#### `include(filepath)`
This takes a `filepath` and outputs the content of the file as a string.

Useful for when you want to include the exact same HTML in multiple places (e.g. the navbar or footer of a page).

#### `includeTemplate(filepath, namespace)`
This takes a `filepath` and treats it as another template literal - attemping to evaluate it.

`namespace` is a Javascript object that is applied to the namespace when evaluating the template literal. For example:

```html
// example.html
<h1>${title}</h1>
```

```html
<!-- index.html -->
${ includeTemplate("./example.html", { title: "Hello!" }) }
```

The final `index.html` in this example will be:

```html
<h1>Hello!</h1>
```

## Other types of files 
When building, any non `.html` or `.rss` files are copied without preprocessing.

## Telling the build script to ignore files or folders
By naming your file or folder with the format `*.dev.*`, the build script will skip over that file.

This is useful for when you want to write documentation, tests or components that will eventually be used in non-`*.dev.*` files.

## Common tricks
### Including more complex functionality inside a `${}`
So far we've only seen `${}` blocks contain the name of a variable or a single function. Sometimes you might need to store temporary values in order to do more complicated operations.

In this case you can write an inline anonymous function and call it

```
(() => {Code goes here})();
```

It still works within a `${}` block. 

```
${(() => {})()}
```

This does look messy at first but once you wrap your head around it - you can see what it is doing.

---

This is the end of the build system, it is that simple. However, because it is simple, it means developing more complicated functionality (e.g. the blog) actually gets quite messy. So further documentation past this point is talking specifically about the Telsoc website and its design rather than the design of the build system.
