#!/usr/bin/env node
"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const walk = (dir, endswith, done) => {
    let results = [];
    fs.readdir(dir, (err, files) => {
        if (err)
            return done(err);
        let pending = files.length;
        if (!pending)
            return done(void 0, results);
        files.forEach((file) => {
            file = path.resolve(dir, file);
            fs.stat(file, (err, stats) => {
                if (stats && stats.isDirectory()) {
                    if (['node_modules' /* TODO: parse .gitignore */].indexOf(path.basename(file)) > -1)
                        !--pending && done(void 0, results);
                    else
                        walk(file, endswith, (err, res) => {
                            if (typeof res !== 'undefined')
                                results = results.concat(res);
                            if (!--pending)
                                done(void 0, results);
                        });
                }
                else {
                    if (file.length >= endswith.length && file.slice(file.length - endswith.length) === endswith)
                        results.push(file);
                    if (!--pending)
                        done(void 0, results);
                }
            });
        });
    });
};
const neg1_to_max = (n) => n === -1 ? Number.MAX_SAFE_INTEGER : n;
const parseTemplateUrl = (fname) => {
    const data = fs.readFileSync(fname, 'utf8').replace(/\s/g, '');
    const j = data.slice(data.indexOf('templateUrl') + 'templateUrl'.length + 4);
    return j.slice(0, ((a, b) => a > b ? b : a)(neg1_to_max(j.indexOf('\'')), neg1_to_max(j.indexOf('"'))));
};
if (require.main === module) {
    if (process.argv.length < 3)
        throw Error(`Usage: ${process.argv} PATH`);
    walk(process.argv[2], '.component.ts', (err, fnames) => {
        if (err != null)
            throw err;
        else if (fnames == null || !fnames.length)
            throw TypeError('fnames is empty');
        const m = new Map(fnames.map(fname => [fname, parseTemplateUrl(fname)]));
        console.info(m);
    });
}
