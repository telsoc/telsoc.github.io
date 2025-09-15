const { readFile, writeFile, copyFile, readdir, lstat, stat, mkdir } = require("fs").promises;
const path = require("path");


// Standard functions 
// Below is a collection of functions that can be used inside ${} blocks when 
// writing pages.
// All functions must evaluate to a string.

const evalScope = [include, includeTemplate]    // It is required to explicitly 
                                                // pass the functions that we 
                                                // allow the preprocesser to use
const evalTemplate = (template) => new Function(
                                    ...evalScope.map(f => f.name),      // Scope
                                    `return \`${template}\`;`)          // Code
                                        (...evalScope);                 // Call


async function include(path, { encoding = "utf8" } = {}) {
    try {
        const data = readFile(path, encoding);
        return data;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}


async function includeTemplate(path, { encoding = "utf8" } = {}, ...params) {
    const data = await include(path, encoding);
    return evalTemplate(data);
}


// Main build process
const indir = "prebuild";
const outdir = "build";

async function processFile(inpath, outpath) {
    // Get file location
    const raw = await include(inpath);

    // Process file contents
    const data = evalTemplate(raw);

    // Ensure parent dirs exist
    await mkdir(path.dirname(outpath), { recursive: true});

    // Copy to /build
    try {
        await writeFile(outpath, data);
    } catch (err) {
        console.error("While trying to write: ", inpath, "to", outpath);
        throw err;
    }
}

async function processDir(dirpath) {
    // Check if directory exists and if not, create it
    try {
        await stat(dirpath);
    } catch (err) {
        if (err.code === "ENOENT")
            await mkdir(dirpath);
        else
            throw err;
    }

    (await readdir(dirpath)).forEach(async file => {
        const inPath = path.join(dirpath, file);
        const buildPath = path.join(dirpath, file).replace(indir, outdir);

        if (file.endsWith(".html") || file.endsWith(".rss") || file.endsWith(".css"))
            processFile(inPath, buildPath);
        else {
            const stat = await lstat(inPath)

            if (stat.isDirectory()) 
                processDir(inPath);
            else 
                await copyFile(inPath, buildPath);
        }
    });
}



processDir(path.join("./", indir));
