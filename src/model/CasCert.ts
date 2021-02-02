export namespace CasCert {
    export type DistinguishedName = {
      CN?: string;
      O?: string;
      OU?: string;
      L?: string;
      C?: string;
      ST?: string;
      emailAddress?: string;
    }
    
    type Extension = {
      critical: boolean;
    }

    export type ExtensionBasicConstraints = Extension & {
      CA: boolean;
    }
    
    export type ExtensionKeyUsage = Extension & {
      digitalSignature: boolean;
      nonRepudiation: boolean;
      keyEncipherment: boolean;
      dataEncipherment: boolean;
      keyAgreement: boolean;
      keyCertSign: boolean;
      cRLSign: boolean;
      encipherOnly: boolean;
      decipherOnly: boolean;
    }
    
    export type ExtensionKeyUsageExtended = Extension & {
      serverAuth: boolean;
      clientAuth: boolean;
      codeSigning: boolean;
      emailProtection: boolean;
      timeStamping: boolean;
      ocspSigning: boolean;
    }
    
    export type Extensions = {
      basicConstraints?: ExtensionBasicConstraints;
      authorityKeyIdentifier?: string;
      subjectKeyIdentifier?: string;
      keyUsage?: ExtensionKeyUsage;
      keyUsageExtended?: ExtensionKeyUsageExtended;
    }
    export enum KeyAlgorithms {
      RSA='RSA',
      MD2_RSA='MD2_RSA',
      iso='iso',
      MD5_RSA='MD5_RSA',
      SHA1_RSA='SHA1_RSA',
      RSAOAEPEncryptionSET='RSAOAEPEncryptionSET',
      id_RSAES_OAEP='id-RSAES-OAEP',
      RSASSA_PSS='RSASSA-PSS',
      sha256WithRSAEncryption='sha256WithRSAEncryption',
      EC='ecPublicKey'
    }

    export enum EllipticCurves {
      secp384r='secp384r1'
    }

    export type KeyAlgorithm = KeyAlgorithms.RSA|
                        KeyAlgorithms.MD2_RSA|
                        KeyAlgorithms.iso|
                        KeyAlgorithms.MD5_RSA|
                        KeyAlgorithms.SHA1_RSA|
                        KeyAlgorithms.RSAOAEPEncryptionSET|
                        KeyAlgorithms.id_RSAES_OAEP|
                        KeyAlgorithms.RSASSA_PSS|
                        KeyAlgorithms.sha256WithRSAEncryption|
                        KeyAlgorithms.EC|
                        string;

    export type EllipticCurve = EllipticCurves.secp384r|string;

    export class KeyInfo {
      algorithmId: KeyAlgorithm
      constructor(algorithmId: KeyAlgorithm) {
        this.algorithmId = algorithmId;
      }
    }
    
    export class KeyInfoRsa extends KeyInfo {
      bitLength: number;
      constructor(algorithmId: KeyAlgorithm, bitLength: number) {
        super(algorithmId);
        this.bitLength = bitLength;
      }
    }
    
    export class KeyInfoEc extends KeyInfo {
      curve: EllipticCurve;
      constructor(algorithmId: KeyAlgorithm, curve: EllipticCurve) {
        super(algorithmId);
        this.curve = curve;
      }
    }
    
    export type ValidityPeriod = {
      notBefore: number;
      notAfter: number;
    }
    
    export class Cert {
    
      subject: DistinguishedName;
      serialNr: string;
      validityPeriod: ValidityPeriod;
      issuer: DistinguishedName;
      extensions: Extensions;
      publicKeyInfo: KeyInfo;
      base64: string;
      sha1DigestHex: string;
      sha256DigestHex: string;
    
      constructor(subject: DistinguishedName, serialNr: string, validityPeriod: ValidityPeriod, issuer: DistinguishedName,
        extensions: Extensions, publicKeyInfo: KeyInfo, base64: string, sha1DigestHex: string, sha256DigestHex: string) {
          this.subject = subject;
          this.serialNr = serialNr;
          this.validityPeriod = validityPeriod;
          this.issuer = issuer;
          this.extensions = extensions;
          this.publicKeyInfo = publicKeyInfo;
          this.base64 = base64;
          this.sha1DigestHex = sha1DigestHex;
          this.sha256DigestHex = sha256DigestHex;
      }
    }
    
    export class CaCert extends Cert {
    
      deployed: boolean;
      
      constructor(subject: DistinguishedName, serialNr: string, validityPeriod: ValidityPeriod, issuer: DistinguishedName,
        extensions: Extensions, publicKeyInfo: KeyInfo, base64: string, sha1DigestHex: string, sha256DigestHex: string,
        deployed: boolean) {
          super(subject, serialNr, validityPeriod, issuer, extensions, publicKeyInfo, base64, sha1DigestHex, sha256DigestHex);
          this.deployed = deployed;
      }
    }
    
    export class ClientCert extends Cert {
    
      authenticated: boolean;
    
      constructor(subject: DistinguishedName, serialNr: string, validityPeriod: ValidityPeriod, issuer: DistinguishedName,
        extensions: Extensions, publicKeyInfo: KeyInfo, base64: string, sha1DigestHex: string, sha256DigestHex: string,
        authenticated: boolean) {
          super(subject, serialNr, validityPeriod, issuer, extensions, publicKeyInfo, base64, sha1DigestHex, sha256DigestHex);
          this.authenticated = authenticated;
      }
    }
}
