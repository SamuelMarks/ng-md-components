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
const highlight_js_1 = require("highlight.js");
const readline = __importStar(require("readline"));
marked_ts_1.Marked.setOptions({ highlight: (code, lang) => highlight_js_1.highlight(lang, code).value });
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
                            escapeBrace(to_fname, erro => {
                                if (erro != null)
                                    return callback(erro);
                                console.info(`GENERATED\t${to_fname}`);
                                if (!--pending)
                                    callback(void 0);
                            });
                        });
                    });
            });
        });
    });
};
const neg1_to_max = (n) => n === -1 ? Number.MAX_SAFE_INTEGER : n;
// *VERY* basic parser. Doesn't handle comments. In fact, you are recommended to set `templateUrl` in a comment!
const parseTemplateUrl = (fname, callback) => {
    fs.readFile(fname, 'utf8', (err, data) => {
        if (err != null)
            return callback(err);
        data = data.replace(/\s/g, '');
        const j = data.slice(data.indexOf('templateUrl') + 'templateUrl'.length + 4);
        return callback(void 0, j.slice(0, ['\'', '"', '`']
            .map(c => neg1_to_max(j.indexOf(c)))
            .reduce((a, b) => a > b ? b : a, Number.MAX_SAFE_INTEGER)));
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
const escapeBrace = (fname, callback) => {
    // TODO: Character by character parser, to support one line blocks
    const lineReader = readline.createInterface({
        input: fs.createReadStream(fname)
    });
    let lines = [];
    let code_block = 0;
    lineReader.on('line', (line) => {
        if ((code_block & 1) !== 0)
            line = line.replace(`{`, `{{'{'}}`);
        code_block += ['<code', '</code'].reduce((a, b) => a + line.indexOf(b) > -1, 0);
        lines.push(line);
    });
    lineReader.on('close', () => fs.writeFile(fname, lines.join('\n'), callback));
};
if (require.main === module) {
    if (process.argv.length < 3)
        throw Error(`Usage: ${process.argv} PATH`);
    walk(process.argv[2], '.component.ts', err => {
        if (err != null)
            throw err;
    });
}
