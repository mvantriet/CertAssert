import { ICasDb } from '../interfaces/ICasDb';
import {CasCert} from '../../model/CasCert';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';

export class CasDbDDB extends CasComponent implements ICasDb {
    
    constructor(logger: ICasLogger) {
        super(logger);
    }

    putCert(_cert: CasCert.Cert): void {

    }

    getCert(_shaDigest: string): CasCert.Cert | null {
        return null;
    }

    hasCert(_shaDigest: string): boolean {
        return false;
    }

    knownCerts(): Array<string> {
        return new Array<string>();
    }
    
}