import { ICasDb } from '../interfaces/ICasDb';
import * as CasCert from '../../model/CasCert';
import { CasComponent } from '../../common/CasComponent';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';

export class CasDbInMem extends CasComponent implements ICasDb {

    private certs:Map<string, CasCert.Cert>;

    constructor(logger: ICasLogger) {
        super(logger);
        this.certs = new Map<string, CasCert.Cert>();
    }

    putCert(cert: CasCert.Cert): void {
        this.certs.set(cert.sha256DigestHex, cert);
    }

    getCert(shaDigest: string): CasCert.Cert | null {
        return this.hasCert(shaDigest) ? this.certs.get(shaDigest) : null;
    }

    hasCert(shaDigest: string): boolean {
        return this.certs.has(shaDigest);
    }

    knownCerts(): Array<string> {
        return Array.from(this.certs.keys());
    }
    
}