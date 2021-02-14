import {Request, Response} from 'express';
import React from "react";
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { CasLoginView } from "../views/login/CasLoginView";
import { Ssr } from "../views/ssr/CasSsrHelper";

export class CasInteractionsHandler extends CasHandler implements ICasApiHandler {
    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    public handle(req: Request, resp: Response): void {
        console.log(req.client.authorized)
        console.log(req.cas)
        
        resp.send(
            Ssr('Login',<CasLoginView 
                            title={'Login' }
                            authorised={req.client.authorized}
                            casExtensions={req.cas}
                        />)
        );
    }
}