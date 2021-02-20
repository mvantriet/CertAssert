import {Request, Response, NextFunction} from "express";
import { Certificate } from '@fidm/x509';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { Cert } from "../../model/CasCert";
import { CertificateUtils } from "../../utils/CertificateUtils";

export class CasCertChainVerifyHandler extends CasHandler implements ICasApiHandler {

    private trustedAnchors: Array<string>;

    constructor(db: ICasDb, logger: ICasLogger, acceptedCAs: Array<Cert>) {
        super(db, logger);
        this.trustedAnchors = acceptedCAs.map((cert: Cert) => cert.sha256DigestHex);
    }

    public handle(req: Request, _resp: Response, next: NextFunction): void {
        if (req.cas.clientCertificate && req.client.authorized === false) {
            // Verify chain bottom up against trusted anchors
            let verified:boolean = false;
            let currentParsed: Certificate = Certificate.fromPEM(Buffer.from(req.cas.clientCertificate.base64));
            let nextParsed: Certificate;
            let currentCert: Cert = req.cas.clientCertificate;
            let cont: boolean = true;
            while(verified === false && cont) {
                const nextCert: Cert = currentCert.issuerCertRef;
                if (nextCert) {
                    nextParsed = Certificate.fromPEM(Buffer.from(currentCert.issuerCertRef.base64));
                } else {
                    cont = false;
                    continue;
                }
                // Check time validities
                if (CertificateUtils.checkTimeValidity(currentCert) && CertificateUtils.checkTimeValidity(nextCert)) {
                    // Check chain
                    if (currentParsed.isIssuer(nextParsed)) {
                        // Check issuer
                        verified = this.trustedAnchors.includes(nextCert.sha256DigestHex);
                    }
                }
                cont = nextCert.issuerCertRef !== undefined;
                // Next
                currentCert = nextCert;
                currentParsed = nextParsed;
            }
            req.client.authorized = verified;
        }
        next();
    }
}