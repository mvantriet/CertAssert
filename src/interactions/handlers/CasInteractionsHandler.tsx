import {Request, Response} from 'express';
import React from "react";
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { CasLoginView } from "../views/login/CasLoginView";
import { Ssr } from "../views/ssr/CasSsrHelper";

export class CasInteractionsHandler extends CasHandler implements ICasApiHandler {
    
    private singinPath: string;
    private abortPath: string;

    constructor(db: ICasDb, logger: ICasLogger, signinPath: string, abortPath: string) {
        super(db, logger);
        this.singinPath = signinPath;
        this.abortPath = abortPath;
    }

    public handle(req: Request, resp: Response): void {
        resp.send(
            Ssr('Login',<CasLoginView 
                            title={'Login' }
                            authorised={req.client.authorized}
                            casExtensions={req.cas}
                            signinPath={this.singinPath}
                            abortPath={this.abortPath}
                        />)
        );
    }
}