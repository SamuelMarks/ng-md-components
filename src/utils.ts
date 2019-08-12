import * as fs from 'fs';

import { Marked } from 'marked-ts';
import * as path from 'path';
import * as readline from 'readline';
import { highlight } from 'highlight.js';

Marked.setOptions({ highlight: (code, lang) => lang == null? code : highlight(lang, code).value });


export const recursiveMd2Html = (dir: string, ext: string, callback: (err?: NodeJS.ErrnoException) => void): void => {
    fs.readdir(dir, (err: NodeJS.ErrnoException | null, files: string[]) => {
        if (err != null) return callback(err);
        let pending = files.length;
        if (!pending) return callback(void 0);
        files.forEach((fname: string) => {
            fname = path.resolve(dir, fname);
            fs.stat(fname, (error: NodeJS.ErrnoException | null, stats: fs.Stats) => {
                if (error != null) return callback(error);
                else if (stats && stats.isDirectory()) {
                    if (['node_modules', '.git', /* TODO: parse .gitignore */].indexOf(path.basename(fname)) > -1)
                    /* tslint:disable:no-unused-expression */ !--pending && callback(void 0);
                    else
                        recursiveMd2Html(fname, ext, (e?: NodeJS.ErrnoException) => {
                            if (e != null) return callback(e);
                            if (!--pending) callback(void 0);
                        });
                } else if (fname.length >= ext.length && fname.slice(fname.length - ext.length) === ext
                    && ['README.md', 'LICENSE.md', 'CHANGELOG.md'].indexOf(path.basename(fname)) === -1)
                    parseTemplateUrl(fname.split('').reverse().join('')
                            .replace(ext.split('').reverse().join(''), 'st.').split('').reverse().join(''),
                        (er, templateUrl) => {
                            if (er != null) return callback(er.errno === -2 ? void 0 : er);
                            else if (templateUrl == null || !templateUrl.length || !templateUrl.endsWith(ext))
                                return callback();
                            handleMarkdown(fname, path.join(path.dirname(fname), templateUrl), (e_r, to_fname) => {
                                if (e_r != null) return callback(e_r);
                                escapeBrace(to_fname as string, ext, erro => {
                                    if (erro != null) return callback(erro);
                                    console.info(`Generated:\t ${to_fname}`);
                                    if (!--pending) callback(void 0);
                                });
                            });
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
        if (data.indexOf('@Component') === -1) return callback(void 0); // We're not in a component
        const fst = data.indexOf('templateUrl');
        if (fst === -1) return callback(void 0);
        const j = data.slice(fst + 'templateUrl'.length + 3);
        return callback(void 0,
            j.slice(0, ['\'', '"', '`']
                .map(c => neg1_to_max(j.indexOf(c)))
                .reduce((a, b) => a > b ? b : a, Number.MAX_SAFE_INTEGER)));
    });
};

const handleMarkdown = (fname: string, templateUrl: string,
                        callback: (err: NodeJS.ErrnoException | null, to_fname?: string) => void): void => {
    fs.readFile(templateUrl, 'utf8', (err, data) => {
        if (err != null) callback(err);
        const to_fname = `${templateUrl.substr(0, templateUrl.length - 3)}.html`;
        fs.writeFile(to_fname, Marked.parse(data), 'utf8', e => callback(e, to_fname));
    });
};

const escapeBrace = (fname: string, ext: string, callback: (err: NodeJS.ErrnoException | null) => void): void => {
    // TODO: Character by character parser, to support one line blocks

    const lineReader = readline.createInterface({
        input: fs.createReadStream(fname)
    });
    const lines: string[] = [
        `<!-- GENERATED FROM './${path.basename(fname).slice(0, -5)}${ext}'. ` +
        'EDIT THAT, XOR DELETE AND EDIT THIS! -->\n'
    ];
    let code_block = 0;

    lineReader.on('line', (line: string) => {
        /* tslint:disable:no-bitwise */
        /*if ((code_block & 1) !== 0)
            line = line.replace(/{/g, `{{'{'}}`);*/
        code_block += ['<code', '</code'].reduce((a, b) => a + line.indexOf(b) > -1 as any as number, 0);
        lines.push(line);
    });
    lineReader.on('close', () =>
        fs.writeFile(fname, lines.join('\n').replace(/{/g, '&#0123;'), callback)
    );
};
