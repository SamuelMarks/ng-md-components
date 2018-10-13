#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

const walk = (dir: string, done: (err: NodeJS.ErrnoException, results?: string[]) => void): void => {
  let results: string[] = [];
  fs.readdir(dir, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err) return done(err);
    let pending = files.length;
    if (!pending) return done(null, results);
    files.forEach((file: string) => {
      file = path.resolve(dir, file);
      fs.stat(file, (err: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (stats && stats.isDirectory()) {
          walk(file, (err: Error, res: string[]) => {
            if (typeof res !== 'undefined')
              results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

if (require.main === module) {
  if (process.argv.length < 3)
    throw Error(`Usage: ${process.argv} PATH`);

  walk(process.argv[2], (err, results) => {
    if (err != null) throw err;
    console.info(results);
  });
}
