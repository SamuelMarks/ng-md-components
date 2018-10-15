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
const marked_ts_1 = require("marked-ts");
const walk = (dir, endswith, callback) => {
    fs.readdir(dir, (err, files) => {
        if (err)
            return callback(err);
        let pending = files.length;
        if (!pending)
            return callback(void 0);
        files.forEach((fname) => {
            fname = path.resolve(dir, fname);
            fs.stat(fname, (error, stats) => {
                if (error != null)
                    return callback(error);
                else if (stats && stats.isDirectory()) {
                    if (['node_modules' /* TODO: parse .gitignore */].indexOf(path.basename(fname)) > -1)
                        !--pending && callback(void 0);
                    else
                        walk(fname, endswith, (e) => {
                            if (e != null)
                                return callback(e);
                            if (!--pending)
                                callback(void 0);
                        });
                }
                else if (fname.length >= endswith.length && fname.slice(fname.length - endswith.length) === endswith)
                    parseTemplateUrl(fname, (er, templateUrl) => {
                        if (er != null)
                            return callback(er);
                        handleMarkdown(fname, templateUrl == null ? templateUrl
                            : path.join(path.dirname(fname), templateUrl), (e_r, to_fname) => {
                            if (e_r != null)
                                return callback(e_r);
                            console.info(`GENERATED\t${to_fname}`);
                            if (!--pending)
                                callback(void 0);
                        });
                    });
            });
        });
    });
};
const neg1_to_max = (n) => n === -1 ? Number.MAX_SAFE_INTEGER : n;
// *VERY* basic parser. Doesn't handle comments.
const parseTemplateUrl = (fname, callback) => {
    fs.readFile(fname, 'utf8', (err, data) => {
        if (err != null)
            return callback(err);
        data = data.replace(/\s/g, '');
        const j = data.slice(data.indexOf('templateUrl') + 'templateUrl'.length + 4);
        return callback(void 0, j.slice(0, ((a, b) => a > b ? b : a)(neg1_to_max(j.indexOf('\'')), neg1_to_max(j.indexOf('"')))));
    });
};
const handleMarkdown = (fname, templateUrl, callback) => {
    if (templateUrl != null && templateUrl.endsWith('.md'))
        fs.readFile(templateUrl, 'utf8', (err, data) => {
            if (err != null)
                callback(err);
            const to_fname = `${templateUrl.substr(0, templateUrl.length - 3)}.html`;
            fs.writeFile(to_fname, marked_ts_1.Marked.parse(data), 'utf8', e => callback(e, to_fname));
        });
};
if (require.main === module) {
    if (process.argv.length < 3)
        throw Error(`Usage: ${process.argv} PATH`);
    walk(process.argv[2], '.component.ts', err => {
        if (err != null)
            throw err;
    });
}
