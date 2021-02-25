import { ICasDb } from '../interfaces/ICasDb';
import * as CasCert from '../../model/CasCert';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';
import { CasComponent } from '../../common/CasComponent';

export class CasDbDDB extends CasComponent implements ICasDb {
    
    constructor(logger: ICasLogger) {
        super(logger);
    }

    putCert(_cert: CasCert.Cert): void {

    }

    getCert(_shaDigest: string): CasCert.Cert | undefined {
        return undefined;
    }

    hasCert(_shaDigest: string): boolean {
        return false;
    }

    knownCerts(): Array<string> {
        return new Array<string>();
    }
    
}