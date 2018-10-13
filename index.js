#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, files) {
        if (err)
            return done(err);
        var pending = files.length;
        if (!pending)
            return done(null, results);
        files.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stats) {
                if (stats && stats.isDirectory()) {
                    walk(file, function (err, res) {
                        if (typeof res !== 'undefined')
                            results = results.concat(res);
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push(file);
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};
if (require.main === module) {
    if (process.argv.length < 3)
        throw Error("Usage: " + process.argv + " PATH");
    walk(process.argv[2], function (err, results) {
        if (err != null)
            throw err;
        console.info(results);
    });
}
