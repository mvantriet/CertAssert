import {CasCert} from '../../model/CasCert';

export interface ICasDb {
    putCert(cert: CasCert.Cert): void;
    getCert(shaDigest: string): CasCert.Cert | null;
    hasCert(shaDigest: string): boolean;
    knownCerts(): Array<string>;
}