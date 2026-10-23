#!/usr/bin/env bun
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { run } from './run';

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Uint8Array);
  return Buffer.concat(chunks).toString('utf8');
}

process.exitCode = await run(process.argv.slice(2), {
  readStdin,
  readFile: (path) => readFile(path, 'utf8'),
  importModule: (path) => import(pathToFileURL(resolve(path)).href),
  writeFile: (path, data) => writeFile(path, data, 'utf8'),
  out: (text) => {
    process.stdout.write(text);
  },
  err: (text) => {
    process.stderr.write(text);
  },
});
