import {Request, Response, NextFunction} from "express";
import { TLSSocket } from "tls";
import { CasCertInputAdaptor } from "../../dataAdaptation/certificate/components/CasInputAdaptor";
import { CasCertificateAdaptation } from "../../dataAdaptation/certificate/common/CasCommonAdaptor";
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { RequestCasExtensions } from "../../dataAdaptation/networking/types/CasNetworkingTypes";
import { ClientCert } from "../../model/CasCert";

export class CasDataAdaptationHandler extends CasHandler implements ICasApiHandler {
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(req: Request, resp: Response, next: NextFunction): void {
        const casCertificateAdaptation: RequestCasExtensions = {};
        const clientCertAdaptation:CasCertificateAdaptation.CertParseResult = CasCertInputAdaptor.fromSocket(
            ((req.socket) as TLSSocket).getPeerCertificate(true), req.client.authorized);
        if (!clientCertAdaptation.failureDetails) {
            // Downcast
            casCertificateAdaptation.clientCertificate = clientCertAdaptation.cert as ClientCert;
        }        req.cas = casCertificateAdaptation;
        next();
    }
}