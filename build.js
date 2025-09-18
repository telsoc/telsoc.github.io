/** Documentation - build.js
 *  
 *  Introduction
 *          build.js is responsible for turning our development (src directory)
 *      into static HTML that can be rendered on github pages. This is stored
 *      in a build directory.
 *          The script runs through every file in the src path and treats them
 *      as JavaScript template literals - that means that it will evaluate any
 *      expression inside ${this block}.
 *          This in itself is very powerful, but there are a few functions 
 *      provided that provide basic functionality by themselves, meaning you
 *      don't have to rewrite them.
 *
 *  Command line use (how to build)
 *          build.js works on node, and is designed to work with only the 
 *      standard library.
 *          The script will make a new /build directory in the current working
 *      directory, then start the process of iterating, evaluating and copying
 *      the scripts.
 *
 *      Simply run
 *          node build.js <target>
 *
 *          In the event of an error, it will be a node runtime error. Please
 *      read the error in full, usually only a small part is relevant to an 
 *      actual development issue.
 *
 *  Writing files in the src directory
 *          Remember, all files in the src directory will be evaluated as 
 *      template literals. Meaning most, if not all, Javascript goes.
 *          But that doesn't mean there aren't things to keep in mind.
 *
 *      1. Files that follow *.dev.* will be ignored
 *              These files won't be copied into the build directory - but they
 *          can still be used in template literals.
 *
 *      2. Write paths with the working directory in mind
 *              All paths will be executed from the working directory. In this
 *          project that is assumed to be /website. So, if I wanted to use the
 *          include function, I have to write the path relative to the /website
 *          directory.
 *          
 *      3. Only .html files actually get evaluated as template strings
 *              This is to ensure things like images don't get misinterpreted
 *          by the build script. It is extremely easy to extend this 
 *          functionality to any file type, and there is plans to make this
 *          possible for the RSS feed.
 *
 *  Functions and their uses
 *          This is the meat and potatoes of build.js. As a developer you only
 *      have to worry about this.
 *
 *
 *          include(path[, encoding=utf8])
 *                  The include function returns the data as-is written in a 
 *              file. Encoding by default is utf8.
 *
 *                  Example:
 *                      ${include("./src/nav.dev.html")}
 *
 *                  Remember that paths are relative to the current working
 *              directory, which is assumed to be /website.
 *
 *          includeTemplate(path, params[, encoding=utf8])
 *                  The includeTemplate function includes a file, but treats
 *              the data as another template to evaluate. When doing this, the 
 *              file is expected to have template-literal like blocks with 
 *              named ${identifiers} in them.
 *                  ...params is a javascript object of parameters that you 
 *              wish to replace the identifiers with.
 *                  If this is confusing, the example may help illustrate.
 *
 *                  Example:
 *                      example.html
 *                          <h1>${title}</h1>
 *
 *                      ${includeTemplate("./src/example.html", { title: "My cool title" } )}
 */

const { readFileSync, writeFileSync, copyFileSync, rmSync, readdirSync, lstatSync, mkdirSync } = require("fs");
const path = require("path");


// Standard functions 
// Below is a collection of functions that can be used inside ${} blocks when 
// writing pages.
// All functions must evaluate to a string.

const evalTemplate = (template, namespace) => {
    with (namespace)
        return eval(`\`${template}\``);
}


/// Includes the contents of a file exactly as-is
function include(filepath, { encoding = "utf8" } = {}) {
    const data = readFileSync(filepath, encoding);
    return data;
}


/// Includes a file but treats it as a template string to apply params to
function includeTemplate(filepath, params, { encoding = "utf8" } = {}) {
    const raw = include(filepath, encoding);

    return evalTemplate(raw, { 
        ...params,
        CURRENT_FILE: filepath,
        CURRENT_PATH: path.parse(filepath).base,
        CURRENT_DIR: path.parse(filepath).dir
    });
}


// Main build process
if (!process.argv[2]) {
    console.error("Please provide a target directory");
    process.exit(1);
}

const cwd = process.cwd();
const srcdir = path.join(cwd, process.argv[2]);
const destdir = path.join(cwd, "build");

function processDir(indir, outdir) {
    for (const entry of readdirSync(indir)) {
        const inPath = path.join(indir, entry);
        const outPath = path.join(outdir, entry);

        const isDirectory = lstatSync(inPath).isDirectory();

        if (isDirectory) {
            if (/\.dev[.a-zA-Z]*$/.test(entry))
                continue;
            processDir(inPath, outPath);
        } else {
            if (/\.dev[.a-zA-Z]*$/.test(entry))
                continue;
            else if (entry.endsWith(".html") || entry.endsWith(".xml")) {
                const raw = include(inPath);
                const evald = evalTemplate(raw, {
                    CURRENT_FILE: entry,
                    CURRENT_PATH: inPath,
                    CURRENT_DIR: path.parse(inPath).dir
                });

                mkdirSync(path.dirname(outPath), { recursive: true });
                writeFileSync(outPath, evald, "utf8");
            } else {
                mkdirSync(path.dirname(outPath), { recursive: true });
                copyFileSync(inPath, outPath);
            }
        }
    }
}

rmSync(destdir, { recursive: true, force: true });
processDir(srcdir, destdir);
console.log("Processing finished!");
