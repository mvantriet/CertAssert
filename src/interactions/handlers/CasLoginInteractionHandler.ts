import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails } from "../../oidc/interfaces/ICasOidcInteractionsProvider";

export class CasLoginInteractionHandler extends CasHandler implements ICasApiHandler {
    
    private interactionsProvider:ICasOidcInteractionsProvider;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
    }

    public async handle(req: Request, resp: Response): Promise<void> {
        const interactionDetails: CasOidcInteractionDetails = await this.interactionsProvider.getInteractionDetails(req,resp);

        let result:any = {};
        if (req.client.authorized && interactionDetails.prompt.name === 'login') {
            this.db.putCert(req.cas.clientCertificate);
            result = {
                login: {
                  account: req.cas.clientCertificate.sha256DigestHex
                },
              };
        } else {
            result = {
                error: 'access_denied',
                error_description: 'End-User is not authorised',
            };
    
        }
        await this.interactionsProvider.finishInteraction(req, resp, result, false);
    }
}