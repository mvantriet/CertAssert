import path from 'path';
import fs from 'fs';

export class CasViewTemplates {

    static getSsrTemplate(): string {
        return fs.readFileSync(path.resolve(__dirname, 'hbs/ssrTemplate.hbs')).toString('utf8');
    }

}