import * as fs from 'fs';
import * as os from 'os';
import * as crypto from 'crypto';
import * as asn1js from 'asn1js';
import * as pvutils from 'pvutils';
import {CasCert} from '../../model/CasCert';
import InternalCertificate from 'pkijs/src/Certificate';
import AttributeTypeAndValue from 'pkijs/src/AttributeTypeAndValue';
import Extension from 'pkijs/src/Extension';
import { ArrayUtils } from '../../utils/ArrayUtils';
const Pkijs = require('pkijs');

enum ExtendedKeyUsageOid {
  CODE_SIGNING='1.3.6.1.5.5.7.3.3',
  SERVER_AUTHENTICATION='1.3.6.1.5.5.7.3.1',
  TIME_STAMPING='1.3.6.1.5.5.7.3.8',
  CLIENT_AUTHENTICATION='1.3.6.1.5.5.7.3.2',
  EMAIL_PROTECTION='1.3.6.1.5.5.7.3.4',
  OCSP_SIGNING='1.3.6.1.5.5.7.3.9'
}

enum ExtensionOid {
  AUTHORITY_KEY_IDENTIFIER='2.5.29.35',
  SUBJECT_KEY_IDENTIFIER='2.5.29.14',
  KEY_USAGE='2.5.29.15',
  BASIC_CONSTRAINTS='2.5.29.19',
  EXTENDED_KEY_USAGE='2.5.29.37'
}

enum KeyAlgorithmOid {
  RSA='1.2.840.113549.1.1.1',
  SHA_256_WITH_RSA_ENCR='1.2.840.113549.1.1.11',
  ISO='1.2.840.113549.1.1.3',
  MD2_RSA='1.2.840.113549.1.1.2',
  SHA1_RSA='1.2.840.113549.1.1.5',
  ID_RSAES_OAEP='1.2.840.113549.1.1.7',
  MD5_RSA='1.2.840.113549.1.1.4',
  RSASSA_PSS='1.2.840.113549.1.1.10',
  RSA_OAEP_EMCRYPTION_SET='1.2.840.113549.1.1.6',
  EC='1.2.840.10045.2.1'
}

enum NamedCurveOid {
  SECP384R1='secp384r1'
}

type CERT_DN_FIELD = 'CN' | 'O' | 'OU' | 'L' | 'C' | 'ST' | 'emailAddress';
type KEY_USAGE_FIELD = 'digitalSignature' | 'nonRepudiation' | 'keyEncipherment' | 'dataEncipherment' | 'keyAgreement' | 'keyCertSign' | 'cRLSign' | 'encipherOnly' | 'decipherOnly';
const CasAdaptationConstants = {
  CERT_BEGIN_LABEL: '-----BEGIN CERTIFICATE-----',
  CERT_END_LABEL: '-----END CERTIFICATE-----',
  CERT_LABEL_REGEXP: /(-----(BEGIN|END) CERTIFICATE-----|[\n\r])/g,
  CERT_DN_OIDS: {
    'CN': '2.5.4.3',
    'O':'2.5.4.10',
    'OU':'2.5.4.11',
    'L':'2.5.4.7',
    'C':'2.5.4.6',
    'ST':'2.5.4.8',
    'emailAddress':'1.2.840.113549.1.9.1'
  },
  KEY_USAGE_BIT_MAPPING: {
    'digitalSignature': 0,
    'nonRepudiation': 1,
    'keyEncipherment': 2,
    'dataEncipherment': 3,
    'keyAgreement': 4,
    'keyCertSign': 5,
    'cRLSign': 6,
    'encipherOnly': 7,
    'decipherOnly': 8
  }
}


export namespace CasAdaptation {

    export type CertParseResult = {
        cert?: CasCert.Cert;
        failureDetails?: string;
    }

    export class Adaptor {


        /**
         * DER -> Internal PkiJS Cert
         * @param der 
         */
        public static fromDer(der: Buffer): InternalCertificate {
            const ber = new Uint8Array(der).buffer;
            const asn1 = asn1js.fromBER(ber);
            return new Pkijs.Certificate({ schema: asn1.result });
        }

        /**
         * Raw file buffer -> CasCert model
         * @param raw 
         */
        public static fromRaw(raw: Buffer): CertParseResult {
            try {
                const pem:string = this.structurePemCert(raw.toString('utf8'));
                const der:Buffer = this.pemToDer(pem);
                const internalCert:any = this.fromDer(der);
                return {
                    cert: new CasCert.Cert(this.adaptCertSubject(internalCert), this.serialNumber(internalCert), this.getCertLifetime(internalCert),
                                this.adaptCertIssuer(internalCert), this.adaptCertExtensions(internalCert), this.adaptPublicKeyInfo(internalCert), pem, 
                                this.certSha1(der), this.certSha256(der))
                };
            } catch (pemErr) {
              return {
                failureDetails: pemErr
              }
            }
        }

        /**
         * PEM -> CasCert model
         * @param certFilePath 
         */
        public static fromPem(certFilePath: string): CertParseResult {
            try {
                return this.fromRaw(fs.readFileSync(certFilePath));
            } catch(ioError) {
              return {
                failureDetails: ioError
              }
            }
        }
        
        private static keyUsageBitSets(bitmask:string, out:CasCert.ExtensionKeyUsage): CasCert.ExtensionKeyUsage {
          Object.keys(CasAdaptationConstants.KEY_USAGE_BIT_MAPPING).forEach((keyUsageField: KEY_USAGE_FIELD) => {
            const prop:any = {};
            prop[keyUsageField] = bitmask[CasAdaptationConstants.KEY_USAGE_BIT_MAPPING[keyUsageField]] === '1';
            Object.assign(out, prop)
          })
          return out
        }

        /**
         * Adapts keyUsage extension
         * @param internalKeyUsage 
         */
        private static adaptKeyUsage(internalKeyUsage: Extension): CasCert.ExtensionKeyUsage {
              let out:CasCert.ExtensionKeyUsage = {
                cRLSign: internalKeyUsage.critical,
                critical: false,
                dataEncipherment: false,
                digitalSignature: false,
                decipherOnly: false,
                encipherOnly: false,
                keyAgreement: false,
                keyCertSign: false,
                keyEncipherment: false,
                nonRepudiation: false
              };
              const raw:Uint8Array = new Uint8Array(internalKeyUsage.parsedValue.valueBeforeDecode);
              if (raw.length > 3) {
                if (raw[0] === 3) {
                  const nofBytes:number = raw[1];
                  if (nofBytes > 0) {
                    const bitshift:number = raw[2];
                    const arr:Uint8Array = new Uint8Array(internalKeyUsage.parsedValue.valueBlock.valueHex);
                    const bitShiftIndices:Array<number> = ArrayUtils.range(internalKeyUsage.parsedValue.valueBlock.blockLength - 1);
                    let shiftedBits = (bitShiftIndices.length === 1) ? (0 << 8) + arr[0] :
                                       bitShiftIndices.reduce((acc:number, idx:number) => ((acc << 8) + arr[idx], 0));
                    shiftedBits >>= bitshift;
                    const bitmask:string = shiftedBits.toString(2);
                    const totalBits:number = ((nofBytes - 1) * 8) - bitshift;
                    out = this.keyUsageBitSets('0'.repeat(totalBits - bitmask.length) + bitmask, out);
                  }
                }
              }


              const keyUsageExtensionRaw = new Uint8Array(internalKeyUsage.parsedValue.valueBeforeDecode);
              if (keyUsageExtensionRaw.length > 3) {
                if (keyUsageExtensionRaw[0] === 3) {
                  const nofBytes = keyUsageExtensionRaw[1];
                  if (nofBytes > 0) {
                    const nofBitShift = keyUsageExtensionRaw[2];
                    let keyUsageBitString = 0;
                    const arr = new Uint8Array(internalKeyUsage.parsedValue.valueBlock.valueHex);
                    for (let i = 0; i < internalKeyUsage.parsedValue.valueBlock.blockLength - 1; i++) {
                      keyUsageBitString = (keyUsageBitString << 8) + arr[i];
                    }
                    keyUsageBitString >>= nofBitShift;
                    let keyUsageBitMask = keyUsageBitString.toString(2);
                    const nofTotalBits = ((nofBytes - 1) * 8) - nofBitShift;
                    keyUsageBitMask = ('0'.repeat(nofTotalBits - keyUsageBitMask.length)) + keyUsageBitMask;
                    return {
                      critical: internalKeyUsage.critical,
                      digitalSignature: keyUsageBitMask[0] === '1',
                      nonRepudiation: keyUsageBitMask[1] === '1',
                      keyEncipherment: keyUsageBitMask[2] === '1',
                      dataEncipherment: keyUsageBitMask[3] === '1',
                      keyAgreement: keyUsageBitMask[4] === '1',
                      keyCertSign: keyUsageBitMask[5] === '1',
                      cRLSign: keyUsageBitMask[6] === '1',
                      encipherOnly: keyUsageBitMask[7] === '1',
                      decipherOnly: keyUsageBitMask[8] === '1',
                    };
                  }
                }
              }

              return out;
          }

          /**
           * 
           * @param extendedKeyUsage 
           */
          private static adaptExtendedKeyUsage(extendedKeyUsage: Extension): CasCert.ExtensionKeyUsageExtended {
            const keyPurposes:Array<string> = extendedKeyUsage.parsedValue.keyPurposes;
            return {
                critical: extendedKeyUsage.critical,
                codeSigning: keyPurposes.includes(ExtendedKeyUsageOid.CODE_SIGNING),
                serverAuth: keyPurposes.includes(ExtendedKeyUsageOid.SERVER_AUTHENTICATION),
                timeStamping: keyPurposes.includes(ExtendedKeyUsageOid.TIME_STAMPING),
                clientAuth: keyPurposes.includes(ExtendedKeyUsageOid.CLIENT_AUTHENTICATION),
                emailProtection: keyPurposes.includes(ExtendedKeyUsageOid.EMAIL_PROTECTION),
                ocspSigning: keyPurposes.includes(ExtendedKeyUsageOid.OCSP_SIGNING),
              };
            }
        
          private static adaptCertExtensions(internalCert: InternalCertificate): CasCert.Extensions {
            const extensionsAdapted: CasCert.Extensions = {};
            if (internalCert.extensions) {
              internalCert.extensions.forEach((internalExtension: Extension) => {
                switch (internalExtension.extnID) {
                    case ExtensionOid.BASIC_CONSTRAINTS:
                      extensionsAdapted.basicConstraints = this.adaptBC(internalExtension);
                      break;
                    case ExtensionOid.KEY_USAGE:
                      extensionsAdapted.keyUsage = this.adaptKeyUsage(internalExtension);
                      break;
                    case ExtensionOid.EXTENDED_KEY_USAGE:
                      extensionsAdapted.keyUsageExtended = this.adaptExtendedKeyUsage(internalExtension);
                      break;
                    case ExtensionOid.AUTHORITY_KEY_IDENTIFIER:
                      extensionsAdapted.authorityKeyIdentifier = this.adaptKeyIdentifier(internalExtension);
                      break;
                    case ExtensionOid.SUBJECT_KEY_IDENTIFIER:
                      extensionsAdapted.subjectKeyIdentifier = this.adaptKeyIdentifier(internalExtension);
                      break;
                    default:
                      break;
                }
              });
          }
          return extensionsAdapted;
        }
        
        /**
         * 
         * @param internalCert 
         */
          private static getCertLifetime(internalCert: InternalCertificate): CasCert.ValidityPeriod {
            return {
              notBefore: internalCert.notBefore.value.getTime(),
              notAfter: internalCert.notAfter.value.getTime(),
            };
          }
        
          /**
           * PkiJS pub key info => CasCert.KeyInfo
           * @param interalCert 
           */
          static adaptPublicKeyInfo(interalCert: InternalCertificate): CasCert.KeyInfo {
            let algorithmLabel: CasCert.KeyAlgorithm = interalCert.subjectPublicKeyInfo.algorithm.algorithmId;
            switch(algorithmLabel) {
              case KeyAlgorithmOid.EC:
                algorithmLabel = CasCert.KeyAlgorithms.EC;
                break;
              case KeyAlgorithmOid.RSA:
                algorithmLabel = CasCert.KeyAlgorithms.RSA;
                break;
              case KeyAlgorithmOid.SHA_256_WITH_RSA_ENCR:
                algorithmLabel = CasCert.KeyAlgorithms.sha256WithRSAEncryption;
                break;
              case KeyAlgorithmOid.ISO:
                algorithmLabel = CasCert.KeyAlgorithms.iso;
                break;
              case KeyAlgorithmOid.MD2_RSA:
                algorithmLabel = CasCert.KeyAlgorithms.MD2_RSA;
                break;
              case KeyAlgorithmOid.SHA1_RSA:
                algorithmLabel = CasCert.KeyAlgorithms.SHA1_RSA;
                break;
              case KeyAlgorithmOid.ID_RSAES_OAEP:
                algorithmLabel = CasCert.KeyAlgorithms.id_RSAES_OAEP;
                break;
              case KeyAlgorithmOid.MD5_RSA:
                algorithmLabel = CasCert.KeyAlgorithms.MD5_RSA;
                break;
              case KeyAlgorithmOid.RSASSA_PSS:
                algorithmLabel = CasCert.KeyAlgorithms.RSASSA_PSS;
                break;
              case KeyAlgorithmOid.RSA_OAEP_EMCRYPTION_SET:
                algorithmLabel = CasCert.KeyAlgorithms.RSAOAEPEncryptionSET;
                break;
              default:
                // Already set to raw string
                break;
            }
            const parsedKey: any = interalCert.subjectPublicKeyInfo.parsedKey;
            if (parsedKey && parsedKey.namedCurve) {
              const curveLabel: CasCert.EllipticCurve = 
                (parsedKey.namedCurve === NamedCurveOid.SECP384R1 ? CasCert.EllipticCurves.secp384r
                : parsedKey.namedCurve);
              return new CasCert.KeyInfoEc(algorithmLabel, curveLabel);
            } else if (parsedKey && parsedKey.modulus) {
              return new CasCert.KeyInfoRsa(algorithmLabel, 
                  parsedKey.modulus.valueBlock.valueHex.byteLength * 8);
            }
            return new CasCert.KeyInfo('UNKNOWN');
          }
        
        /**
         * PkiJS Subject -> CasCert.Subject: DN
         * @param internalCert
         */
          private static adaptCertSubject(internalCert: InternalCertificate): CasCert.DistinguishedName {
            return this.adaptDn(internalCert.subject.typesAndValues);
          }

        /**
         * PkiJS Issuer -> CasCert.Subject: DN
         * @param internalCert
         */
        private static adaptCertIssuer(internalCert: InternalCertificate): CasCert.DistinguishedName {
            return this.adaptDn(internalCert.issuer.typesAndValues);
          }

                  /**
         * PkiJS DN -> CasCert.DistinguishedName
         * @param dnValues 
         */
        private static adaptDn(dnValuesIn: Array<AttributeTypeAndValue>): CasCert.DistinguishedName {
          const out:CasCert.DistinguishedName = {};
          Object.keys(CasAdaptationConstants.CERT_DN_OIDS).forEach((dnField: CERT_DN_FIELD) => {
            this.insertIfExists(dnValuesIn, dnField, CasAdaptationConstants.CERT_DN_OIDS[dnField], out);
          })
          return out;
      }

      /**
       * PkiJS BasicConstraints -> CasCert.BasicConstraints
       * NOTE: Typed value cannot be used as it does not define critical
       * @param internalBasicConstraints
       */
        private static adaptBC(internalBasicConstraints: any): CasCert.ExtensionBasicConstraints {
          return {CA: internalBasicConstraints.parsedValue.cA, critical: internalBasicConstraints.critical};
        }
        
        /**
         * PkiJS Authority|Subject KeyIdentifer -> string
         * @param keyIdentifier 
         * @param oid 
         */
        private static adaptKeyIdentifier(keyIdentifierExtension: any): string {
          if (keyIdentifierExtension.parsedValue.keyIdentifier) {
              return this.bufferToHex(keyIdentifierExtension.parsedValue.keyIdentifier.valueBlock.valueHex);
          } else {
              return this.bufferToHex(keyIdentifierExtension.parsedValue.valueBlock.valueHex);
          }
        }

          /**
           * Internal PkiJS cert -> serial string
           * @param pkijsCert 
           */
          private static serialNumber(pkijsCert: any): string {
            return pvutils.bufferToHexCodes(pkijsCert.serialNumber.valueBlock.valueHex)
                  .trim().toLowerCase();
          }

          /**
           * DER -> sha256
           * @param der 
           */
          private static certSha256(der: Buffer): string {
              return crypto.createHash('sha256')
                          .update(der)
                          .digest('hex');
          }
          
          /**
           * DER -> sha1
           * @param der
           */
          private static certSha1(der: Buffer): string {
              return crypto.createHash('sha1')
                          .update(der)
                          .digest('hex');
          }
          /**
           * Inserts value corresponding to typeId to outstruct if it exists
           * @param parentStruct
           * @param candidateChild 
           * @param typeId 
           * @param outStruct 
           */
          private static insertIfExists(parentStruct: Array<AttributeTypeAndValue>, candidateChild: string, typeId: string, outStruct: any): void {
              const entity:AttributeTypeAndValue | undefined = parentStruct.find((item: any) => item.type === typeId);
              if (entity) {
                const value:any = entity.value.valueBlock.value;
                if (value) {
                  outStruct[candidateChild] = value;
                }
              }
          }
          
          /**
           * PEM -> DER
           * @param base64cert 
           */
          private static pemToDer(pem: string): Buffer {
            const derStr: string = pem.replace(CasAdaptationConstants.CERT_LABEL_REGEXP, '');
            return Buffer.from(derStr, 'base64');
          }

          /**
           * Restructures PEM cert to ensure consistency 
           * when x509 PEM's format begin and end label are added
           * @param pemCert 
           */
          private static structurePemCert(pemCert: string): string {
            let out:string = pemCert;
            let certLabelsAdded:boolean = false;
            const certBeginLabelIdx:number = pemCert.indexOf(CasAdaptationConstants.CERT_BEGIN_LABEL);
            const certEndLabelIdx:number = pemCert.indexOf(CasAdaptationConstants.CERT_END_LABEL);
            if (certBeginLabelIdx === -1) {
                out = `${CasAdaptationConstants.CERT_BEGIN_LABEL}${os.EOL}${out}`;
                certLabelsAdded = true;
            }
            if (certEndLabelIdx === -1) {
                out = `${out + os.EOL}${CasAdaptationConstants.CERT_END_LABEL}`;
                certLabelsAdded = true;
            }
            if (!certLabelsAdded) {
                // Make robust for optional openssl -notext flag.
                out = pemCert.substring(certBeginLabelIdx, certEndLabelIdx + CasAdaptationConstants.CERT_END_LABEL.length);
            }
            return out;
          }

          /**
           * Buffer -> hex
           * @param hexBuffer 
           */
          private static bufferToHex(hexBuffer: Buffer): string {
            let out = '';
            new Uint8Array(hexBuffer).forEach((word: any) => out += parseInt(word, 10).toString(16));
            return out;
          }
    }
}