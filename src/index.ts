import { Command, flags } from '@oclif/command';

import { recursiveMd2Html } from './utils';


class NgMdComponents extends Command {
    static description = 'describe the command here';

    static flags = {
        // add --version flag to show CLI version
        version: flags.version({ char: 'v' }),
        help: flags.help({ char: 'h' }),
        // flag with a value (-n, --name=VALUE)
        directory: flags.string({ char: 'd', description: 'Directory to recurse through', required: true }),
        ext: flags.string({ char: 'e', description: 'File extension to look for', default: '.md' }),
    };

    async run() {
        /* tslint:disable:no-shadowed-variable */
        const { args, flags } = this.parse(NgMdComponents);

        if (!(flags.ext as string).startsWith('.')) flags.ext = `.${flags.ext}`;

        recursiveMd2Html(flags.directory, flags.ext as string, err => {
            if (err != null) throw err;
        });
    }
}

export = NgMdComponents;
