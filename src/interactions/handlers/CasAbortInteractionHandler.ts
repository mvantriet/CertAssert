import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasOidcInteractionsProvider } from "../../oidc/interfaces/ICasOidcInteractionsProvider";

export class CasAbortInteractionHandler extends CasHandler implements ICasApiHandler {
    
    private interactionsProvider:ICasOidcInteractionsProvider;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
    }

    public async handle(req: Request, resp: Response): Promise<void> {
        await this.interactionsProvider.finishInteraction(req, resp, {
            error: 'access_denied',
            error_description: 'User aborted'
        }, false)
    }
}