#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';

import { Marked } from 'marked-ts';

const walk = (dir: string, endswith: string,
              callback: (err?: NodeJS.ErrnoException) => void): void => {
  fs.readdir(dir, (err: NodeJS.ErrnoException, files: string[]) => {
    if (err) return callback(err);
    let pending = files.length;
    if (!pending) return callback(void 0);
    files.forEach((fname: string) => {
      fname = path.resolve(dir, fname);
      fs.stat(fname, (error: NodeJS.ErrnoException, stats: fs.Stats) => {
        if (error != null) return callback(error);
        else if (stats && stats.isDirectory()) {
          if (['node_modules' /* TODO: parse .gitignore */].indexOf(path.basename(fname)) > -1)
            !--pending && callback(void 0);
          else
            walk(fname, endswith, (e?: NodeJS.ErrnoException) => {
              if (e != null) return callback(e);
              if (!--pending) callback(void 0);
            });
        } else if (fname.length >= endswith.length && fname.slice(fname.length - endswith.length) === endswith)
          parseTemplateUrl(fname, (er, templateUrl) => {
            if (er != null) return callback(er);
            handleMarkdown(fname, templateUrl == null ? templateUrl
              : path.join(path.dirname(fname), templateUrl), (e_r, to_fname) => {
              if (e_r != null) return callback(e_r);
              console.info(`GENERATED\t${to_fname}`);
              if (!--pending) callback(void 0);
            })
          });
      });
    });
  });
};

const neg1_to_max = (n: number): number => n === -1 ? Number.MAX_SAFE_INTEGER : n;

// *VERY* basic parser. Doesn't handle comments. In fact, you are recommended to set `templateUrl` in a comment!
const parseTemplateUrl = (fname: string, callback: (err?: NodeJS.ErrnoException, data?: string) => void) => {
  fs.readFile(fname, 'utf8', (err, data) => {
    if (err != null) return callback(err);
    data = data.replace(/\s/g, '');
    const j = data.slice(data.indexOf('templateUrl') + 'templateUrl'.length + 4);
    return callback(void 0,
      j.slice(0, ['\'', '"', '`']
        .map(c => neg1_to_max(j.indexOf(c)))
        .reduce((a, b) => a > b ? b : a, Number.MAX_SAFE_INTEGER)));
  });
};

const handleMarkdown = (fname: string, templateUrl: string | undefined,
                        callback: (err?: NodeJS.ErrnoException, to_fname?: string) => void): void => {
  if (templateUrl != null && templateUrl.endsWith('.md'))
    fs.readFile(templateUrl, 'utf8', (err, data) => {
      if (err != null) callback(err);
      const to_fname = `${templateUrl.substr(0, templateUrl.length - 3)}.html`;
      fs.writeFile(to_fname, Marked.parse(data), 'utf8', e => callback(e, to_fname));
    })
};

if (require.main === module) {
  if (process.argv.length < 3)
    throw Error(`Usage: ${process.argv} PATH`);

  walk(process.argv[2], '.component.ts', err => {
    if (err != null) throw err;
  });
}
