import { ICasApiHandler } from "../interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';

export class CasListHandler extends CasHandler implements ICasApiHandler {
    
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(req: Request, resp: Response): void {
        if (req.client.authorized) {
            resp.status(200).send({list: this.db.knownCerts()});
        } else {
            resp.status(403).send({});
        }
    }
}