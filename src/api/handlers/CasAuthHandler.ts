import { ICasApiHandler } from "../interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasComponent } from "../../common/CasComponent";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";

export class CasAuthHandler extends CasComponent implements ICasApiHandler {
    
    constructor(logger: ICasLogger) {
        super(logger);
    }

    public handle(req: Request, resp: Response): void {
        resp.status(200).send({result: req.client.authorized});
    }
}