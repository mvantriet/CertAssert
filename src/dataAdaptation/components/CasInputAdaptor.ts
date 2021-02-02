import { CasAdaptation } from '../common/CasCommonAdaptor';
import { Certificate } from 'tls';

export class CasCertInputAdaptor {

    public static fromPem(input: string): CasAdaptation.CertParseResult {
        return CasAdaptation.Adaptor.fromPem(input);
    }

    public static fromSocketCert(input: Certificate): CasAdaptation.CertParseResult {
        // TODO
        return {failureDetails: 'UnImplemented Method'}
    }
}