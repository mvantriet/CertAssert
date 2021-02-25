import * as CasCert from "../model/CasCert";
import { CasCertificateAdaptation } from "../dataAdaptation/certificate/common/CasCommonAdaptor";
import { Cert } from "../model/CasCert";
import { readFileSync } from "fs";

export class CertificateUtils {
    
    static nonExistentDnAttributeValue: string = "";

    static normaliseCert(pem: string): string {
        return pem.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');
    }

    static normaliseKey(key: string): string {
        return key.replace(/(?:-----(?:BEGIN|END) ENCRYPTED PRIVATE KEY-----|\s)/g, '');
    }

    static getDnAttributeValue(dn: CasCert.DistinguishedName, attr: CasCert.DistinguishedNameAttribute, fallback?: string): string {
        return (dn[attr] ? dn[attr] : (fallback ? fallback : this.nonExistentDnAttributeValue)) as string;
    }

    static inputAdaptCertArray(certPaths: Array<string>): Array<Cert> {
        return certPaths.map((ca: string) => readFileSync(ca))
        .map((caRaw: Buffer) => CasCertificateAdaptation.Adaptor.fromRaw(caRaw))
        .filter((caParsed: CasCertificateAdaptation.CertParseResult) => caParsed.failureDetails === undefined)
        .map((caParsed: CasCertificateAdaptation.CertParseResult) => caParsed.cert) as Array<Cert>;
    }

    static checkTimeValidity(cert: CasCert.Cert): boolean {
        const now: number = Date.now();
        return now >= cert.validityPeriod.notBefore && now <= cert.validityPeriod.notAfter;
    }
}