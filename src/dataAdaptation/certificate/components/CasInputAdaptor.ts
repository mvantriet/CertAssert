import { CasCertificateAdaptation } from '../common/CasCommonAdaptor';
import { DetailedPeerCertificate } from "tls";
import { Cert, ClientCert } from '../../../model/CasCert';

export class CasCertInputAdaptor {

    public static fromPem(input: string): CasCertificateAdaptation.CertParseResult {
        return CasCertificateAdaptation.Adaptor.fromPem(input);
    }

    public static fromSocket(input: DetailedPeerCertificate, authorised: boolean): CasCertificateAdaptation.CertParseResult {
          const out:CasCertificateAdaptation.CertParseResult = {};
          // Start at root of chain
          let currentCertInChain:DetailedPeerCertificate = input;
          let clientCertificateInChain: ClientCert;
          let currentAdaptedCertInChain:Cert | undefined;
          const seenSerialNrs = [];
          let chainIndex = 0;
          if (currentCertInChain && !this.isEmpty(currentCertInChain)) {
            do {
                let adaptation:CasCertificateAdaptation.CertParseResult = {}
                try {
                    adaptation = CasCertificateAdaptation.Adaptor.fromDer(currentCertInChain.raw, 
                        CasCertificateAdaptation.Adaptor.normalisePem(currentCertInChain.raw.toString('base64')));
                    if (!adaptation.failureDetails) {
                        if (chainIndex === 0) {
                            clientCertificateInChain = adaptation.cert as ClientCert;
                            clientCertificateInChain.authorised = authorised;
                            out.cert = clientCertificateInChain;
                            currentAdaptedCertInChain = clientCertificateInChain;
                        } else {
                            if (currentAdaptedCertInChain) {
                                currentAdaptedCertInChain.setIssuerCertRef(adaptation.cert as Cert);
                            }
                            currentAdaptedCertInChain = adaptation.cert as Cert;
                        }
                    } else {
                        out.failureDetails = `Certificate Input Adaptation failed at chainIndex: ${chainIndex}. Error: ${adaptation.failureDetails}`
                        return out;
                    }
                } catch(err) {
                    out.failureDetails = `Certificate Input Adaptation failed at chainIndex: ${chainIndex}. Error: ${err.toString()}`
                }

              seenSerialNrs.push(currentCertInChain.serialNumber);
              currentCertInChain = currentCertInChain.issuerCertificate;
              chainIndex++;
            } while (currentCertInChain && !seenSerialNrs.includes(currentCertInChain.serialNumber) && !this.isEmpty(currentCertInChain));
          } else {
              out.failureDetails = `No client certificate provided`;
          }
        return out;
    }

    private static isEmpty(obj:any) {
        return Object.keys(obj).length === 0;
    }

}