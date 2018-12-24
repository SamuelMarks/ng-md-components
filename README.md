ng-md-components
================

Markdown `templateUrl` support for Angular

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ng-md-components.svg)](https://npmjs.org/package/ng-md-components)
[![Downloads/week](https://img.shields.io/npm/dw/ng-md-components.svg)](https://npmjs.org/package/ng-md-components)
[![License](https://img.shields.io/npm/l/ng-md-components.svg)](https://github.com/SamuelMarks/ng-md-components/blob/master/package.json)

<!-- toc -->
## Usage

    $ ng-md-components --help

    OPTIONS
      -d, --directory=directory  (required) Directory to recurse through
      -e, --ext=ext              [default: .md] File extension to look for
      -h, --help                 show CLI help
      -v, --version              show CLI version

## Commands
<!-- commands -->


## Example

### Setup
Let's create an Angular application, using Markdown rather than HTML:

    ng new --skip-install --interactive=false a && cd $_
    for c in {a..z}; do ng g m "$c"; ng g c "$c" & done
    fd .html -exec bash -c 'f=${0%.*}; pandoc "$0" -o "$f.md"; rm "$0"' {} \;
    fd .component.ts -exec sed -i 's/component.html/component.md/g' {} \;

### Reversal, using [`fd`](https://github.com/sharkdp/fd), [`bash`](https://www.gnu.org/software/bash) and [`pandoc`](https://pandoc.org)

    fd .md --exclude README.md -exec bash -c 'f=${0%.*}; pandoc "$0" -o "$f.html"; rm "$0"' {} \;
    fd .component.ts -exec sed -i 's/component.md/component.html/g' {} \;

Disadvantages: the `fd` and `bash` aren't really cross-platform, and `pandoc` doesn't do code-highlighting. Also there are no helpful hints saying what's generated, and no explicit way of referencing markdown `templateUrl`.

## Reversal, using `ng-md-components`

Open a file, let's use `src/app/a/a.component.ts`:

```TypeScript
// templateUrl: './a.component.md' <-- add this line

@Component({
  selector: 'app-a',
  templateUrl: './a.component.html', // <-- this gets generated
  styleUrls: ['./a.component.css']
})
export class AComponent {}
```

As you can see, we have added one line, a comment. Note that our simple parsing means the first `templateUrl` will be converted into HTML.

## Alternative approaches

Extend `@Component` or create new decorator.

### Advantages
- Can be used without any new precompilation stage

### Disadvantage
- Bundle size
- Dynamic rather than static, so runtime performance is impacted
