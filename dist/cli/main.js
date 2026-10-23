#!/usr/bin/env node
var __rewriteRelativeImportExtension = (this && this.__rewriteRelativeImportExtension) || function (path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
        });
    }
    return path;
};
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { run } from './run.js';
async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin)
        chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf8');
}
process.exitCode = await run(process.argv.slice(2), {
    readStdin,
    readFile: (path) => readFile(path, 'utf8'),
    importModule: (path) => import(__rewriteRelativeImportExtension(pathToFileURL(resolve(path)).href)),
    writeFile: (path, data) => writeFile(path, data, 'utf8'),
    out: (text) => {
        process.stdout.write(text);
    },
    err: (text) => {
        process.stderr.write(text);
    },
});
