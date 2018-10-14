#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const walk = (dir: string, endswith: string, done: (err?: NodeJS.ErrnoException, results?: string[]) => void): void => {
  let results: string[] = [];
  fs.readdir(dir, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err) return done(err);
    let pending = files.length;
    if (!pending) return done(void 0, results);
    files.forEach((file: string) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (stats && stats.isDirectory()) {
          if (['node_modules' /* TODO: parse .gitignore */].indexOf(path.basename(file)) > -1)
            !--pending && done(void 0, results);
          else
            walk(file, endswith, (err?: NodeJS.ErrnoException, res?: string[]) => {
              if (typeof res !== 'undefined')
                results = results.concat(res);
              if (!--pending) done(void 0, results);
            });
        } else {
          if (file.length >= endswith.length && file.slice(file.length - endswith.length) === endswith)
            results.push(file);
          if (!--pending) done(void 0, results);
        }
      });
    });
  });
};

const neg1_to_max = (n: number): number => n === -1 ? Number.MAX_SAFE_INTEGER : n;

const parseTemplateUrl = (fname: string): string => {
  const data = fs.readFileSync(fname, 'utf8').replace(/\s/g, '');
  const j = data.slice(data.indexOf('templateUrl') + 'templateUrl'.length + 4);
  return j.slice(0, ((a, b) => a > b ? b : a)(neg1_to_max(j.indexOf('\'')), neg1_to_max(j.indexOf('"'))));
};

if (require.main === module) {
  if (process.argv.length < 3)
    throw Error(`Usage: ${process.argv} PATH`);

  walk(process.argv[2], '.component.ts', (err, fnames) => {
    if (err != null) throw err;
    else if (fnames == null || !fnames.length) throw TypeError('fnames is empty');
    const m = new Map<string, string>(fnames.map(fname => [fname, parseTemplateUrl(fname)]) as any);
    console.info(m);
  });
}
