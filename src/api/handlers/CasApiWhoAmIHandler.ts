import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ClientCert } from '../../model/CasCert';

export type CasApiWhoAmiResponse = {
    authorised: boolean,
    cert?: ClientCert
}

export class CasApiWhoAmIHandler extends CasHandler implements ICasApiHandler {
    
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(req: Request, resp: Response): void {
        const out: CasApiWhoAmiResponse = {
            authorised: req.client.authorized
        };
        if (req.client.authorized) {
            out.cert = req.cas.clientCertificate;
            resp.status(200).send(out);
        } else {
            resp.status(403).send(out);
        }
    }
}