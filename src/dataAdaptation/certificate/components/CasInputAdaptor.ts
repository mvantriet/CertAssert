import { CasCertificateAdaptation } from '../common/CasCommonAdaptor';
import { Certificate } from 'tls';

export class CasCertInputAdaptor {

    public static fromPem(input: string): CasCertificateAdaptation.CertParseResult {
        return CasCertificateAdaptation.Adaptor.fromPem(input);
    }

    public static fromSocketCert(input: any): CasCertificateAdaptation.CertParseResult {
        // TODO
        return {failureDetails: 'UnImplemented Method'}
    }
}