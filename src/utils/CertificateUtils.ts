import { CasCert } from "../model/CasCert";

export class CertificateUtils {
    
    static nonExistentDnAttributeValue: string = "";

    static normaliseCert(pem: string): string {
        return pem.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');
    }

    static normaliseKey(key: string): string {
        return key.replace(/(?:-----(?:BEGIN|END) ENCRYPTED PRIVATE KEY-----|\s)/g, '');
    }

    static getDnAttributeValue(dn: CasCert.DistinguishedName, attr: CasCert.DistinguishedNameAttribute, fallback?: string): string {
        return (dn[attr] ? dn[attr] : (fallback ? fallback : this.nonExistentDnAttributeValue));
    }
}