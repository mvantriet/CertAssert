export class CertificateUtils {
    
    static normaliseCert(pem: string): string {
        return pem.replace(/(?:-----(?:BEGIN|END) CERTIFICATE-----|\s)/g, '');
    }

    static normaliseKey(key: string): string {
        return key.replace(/(?:-----(?:BEGIN|END) ENCRYPTED PRIVATE KEY-----|\s)/g, '');
    }
}