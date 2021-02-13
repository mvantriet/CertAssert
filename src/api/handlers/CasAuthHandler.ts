import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';

export class CasAuthHandler extends CasHandler implements ICasApiHandler {
    
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(req: Request, resp: Response): void {
        if (req.client.authorized) {
            resp.status(200).send({result: req.client.authorized});
        } else {
            resp.status(403).send({});
        }
    }
}