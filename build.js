const { readFileSync, writeFileSync, copyFileSync, rmSync, readdirSync, lstatSync, mkdirSync } = require("fs");
const path = require("path");


// Standard functions 
// Below is a collection of functions that can be used inside ${} blocks when 
// writing pages.
// All functions must evaluate to a string.

const evalScope = [include, includeTemplate, includeEval]    
                                                // It is required to explicitly 
                                                // pass the functions that we 
                                                // allow the preprocesser to use
const evalTemplate = (template) => new Function(
                                    ...evalScope.map(f => f.name),      // Scope
                                    `return \`${template}\`;`)          // Code
                                        (...evalScope);                 // Call


/// Includes the contents of a file exactly as-is
function include(filepath, { encoding = "utf8" } = {}) {
    const data = readFileSync(filepath, encoding);
    return data;
}


/// Includes a file but treats it as a template string to apply ...params to
function includeTemplate(path, ...params) {
    const data = include(path, "utf8");         // TODO: allow multiple encodings
    
    // Collecting arg names
    const argNames = [...data.matchAll(/\$\{([^}]+)\}/g)].map(match => match[0].slice(2, -1));
    
    // Applying args
    return new Function(...argNames, `return \`${data}\`;`)(...params);
}

/// Includes a file but treats it as a template string to call evalTemplate on
function includeEval(path, { encoding = "utf8" } = {}) {
    const data = include(path, encoding);
    return evalTemplate(data);
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

        if (isDirectory)
            processDir(inPath, outPath);
        else {
            if (/\.dev[.a-zA-Z]*$/.test(entry))
                continue;
            else if (entry.endsWith(".html")) {
                const raw = include(inPath);
                const evald = evalTemplate(raw);

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
