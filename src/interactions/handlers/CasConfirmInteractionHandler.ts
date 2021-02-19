import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails} from "../../oidc/interfaces/ICasOidcInteractionsProvider";

export class CasConfirmInteractionHandler extends CasHandler implements ICasApiHandler {
    
    private interactionsProvider:ICasOidcInteractionsProvider;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
    }

    public async handle(req: Request, resp: Response): Promise<void> {
        const interactionDetails: CasOidcInteractionDetails = await this.interactionsProvider.getInteractionDetails(req,resp);
        if (req.client.authorized && interactionDetails.prompt.name === 'consent') {
            const consent:any = {};
            consent.rejectedScopes = [];
            consent.rejectedClaims = [];
            consent.replace = false;
            const result = { consent };
            await this.interactionsProvider.finishInteraction(req, resp, result,true);
        } else {
            resp.status(403).send({});
        }
    }
}