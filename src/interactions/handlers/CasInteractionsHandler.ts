import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails } from '../../oidc/interfaces/ICasOidcInteractionsProvider';
import { InteractionsStaticConstants } from '../static/src/constants/InteractionsStaticConstants';
import { PathUtils } from '../../utils/PathUtils';
import { ObjUtils } from '../../utils/ObjUtils';

enum OIDC_INTERACTION {
    LOGIN='login',
    CONSENT='consent'
}

export class CasInteractionsHandler extends CasHandler implements ICasApiHandler {
    
    private interactionsProvider: ICasOidcInteractionsProvider;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
    }

    public async handle(req: Request, resp: Response): Promise<void> {
        const interaction: CasOidcInteractionDetails | undefined = await this.interactionsProvider.getInteractionDetails(req,resp);
        if (interaction) {
            const interactionDetails: CasOidcInteractionDetails = interaction as CasOidcInteractionDetails;
            if (interactionDetails.prompt.name === OIDC_INTERACTION.LOGIN) {
                PathUtils.redirectResponse(resp, PathUtils.buildInteractionPath(
                    PathUtils.buildPath(false, InteractionsStaticConstants.signinPath), interactionDetails.uid)
                );
            }
            else if (interactionDetails.prompt.name === OIDC_INTERACTION.CONSENT) {
                PathUtils.redirectResponse(resp, PathUtils.addQueryParams(PathUtils.buildInteractionPath(
                    PathUtils.buildPath(false, InteractionsStaticConstants.consentPath), interactionDetails.uid),
                    [{
                        name: 'client',
                        value: ObjUtils.fetchField<string>(interactionDetails, ['params', 'client_id'], "unknown")
                    },
                    {
                        name: 'scopes',
                        value: ObjUtils.fetchField<Array<string>>(interactionDetails.prompt, ['details', 'scopes', 'new'], []).join(',')
                    }
                    ])
                );
            }               
        }
    }
}