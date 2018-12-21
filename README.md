ng-md-components
================

Markdown `templateUrl` support for Angular

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ng-md-components.svg)](https://npmjs.org/package/ng-md-components)
[![Downloads/week](https://img.shields.io/npm/dw/ng-md-components.svg)](https://npmjs.org/package/ng-md-components)
[![License](https://img.shields.io/npm/l/ng-md-components.svg)](https://github.com/SamuelMarks/ng-md-components/blob/master/package.json)

<!-- toc -->
# Usage

    $ ng-md-components --help

    OPTIONS
      -d, --directory=directory  (required) Directory to recurse through
      -e, --ext=ext              [default: .md] File extension to look for
      -h, --help                 show CLI help
      -v, --version              show CLI version

# Commands
<!-- commands -->


## Alternative to `ng-md-components`

Let's create an Angular application, using Markdown rather than HTML:

    ng new --skip-install --interactive=false a && cd $_
    for c in {a..z}; do ng g m "$c"; ng g c "$c"; done
    fd .html -exec bash -c 'f=${0%.*}; pandoc "$0" -o "$f.md"; rm "$0"' {} \;
    fd .component.ts -exec sed -i 's/component.html/component.md/g' {} \;

### Reversal

Now let's reverse this:

    fd .md --exclude README.md -exec bash -c 'f=${0%.*}; pandoc "$0" -o "$f.html"; rm "$0"' {} \;
    fd .component.ts -exec sed -i 's/component.md/component.html/g' {} \;

Alright, that all worked. This uses [`fd`](https://github.com/sharkdp/fd), [`bash`](https://www.gnu.org/software/bash) and [`pandoc`](https://pandoc.org), the first two not being cross platform, the last not optimised for code-highlighting.

---

Let's put this reversal into `angular.json` (or generated webpack), and rewrite in TypeScript/JavaScript instead. That's the purpose of this package.

## Approach
The first `templateUrl` will be converted into HTML:

    // templateUrl: './a.component.md'
    @Component({
      selector: 'app-a',
      templateUrl: './a.component.html', // <-- this gets generated
      styleUrls: ['./a.component.css']
    })
    export class AComponent {}

Here any existing `a.component.html` will be replaced.

## Different approaches

Extend `@Component` or create new decorator.

### Advantages
- Can be used without any new precompilation stage

### Disadvantage
- Bundle size
