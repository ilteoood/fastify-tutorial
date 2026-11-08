import { readFile, writeFile } from 'node:fs/promises';

await writeFile('hello.txt', 'hello from Node.js\n');

const text = await readFile('hello.txt', 'utf8');

console.log(text);
