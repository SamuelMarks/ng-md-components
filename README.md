ng-md-components
================

Markdown `templateUrl` support for Angular.

## Test setup

Let's create an Angular application, using Markdown rather than HTML:

    ng new --skip-install a && cd a
    for c in a b c d e f g h i j k l m n o p; do ng g m "$c"; ng g c "$c"; done
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
Comment:

    // templateUrl: './a.component.md'
    @Component({
      selector: 'app-a',
      templateUrl: './a.component.html',
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
