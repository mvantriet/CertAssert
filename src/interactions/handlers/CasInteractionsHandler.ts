import {Request, Response} from 'express';
import { CasHandler } from "../../common/CasHandler";
import { ICasLogger, CasLogLevel } from "../../logging/interfaces/ICasLogger";
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasApiHandler } from "../../routing/interfaces/ICasApiHandler";
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails } from '../../oidc/interfaces/ICasOidcInteractionsProvider';
import { CasInteractionsConstants } from '../constants/CasInteractionsConstants';
import { PathUtils } from '../../utils/PathUtils';
import { ObjUtils } from '../../utils/ObjUtils';

enum OIDC_INTERACTION {
    LOGIN='login',
    CONSENT='consent'
}

export class CasInteractionsHandler extends CasHandler implements ICasApiHandler {
    
    private interactionsProvider: ICasOidcInteractionsProvider;
    private signinPath: string;
    private consentPath: string;
    private transparentSigninFlow: boolean;
    private transparentConsentFlow: boolean;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider,
            signinPath: string, consentPath: string, transparentSigninFlow: boolean, transparentConsentFlow: boolean) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
        this.signinPath = signinPath;
        this.consentPath = consentPath;
        this.transparentSigninFlow = transparentSigninFlow;
        this.transparentConsentFlow = transparentConsentFlow;
    }

    public async handle(req: Request, resp: Response): Promise<void> {
        const interaction: CasOidcInteractionDetails | undefined = await this.interactionsProvider.getInteractionDetails(req,resp);
        if (interaction) {
            const interactionDetails: CasOidcInteractionDetails = interaction as CasOidcInteractionDetails;
            if (interactionDetails.prompt.name === OIDC_INTERACTION.LOGIN) {
                let interactionStep: string = PathUtils.buildInteractionPath(
                    PathUtils.buildPath(false, this.signinPath), interactionDetails.uid);
                if (this.transparentSigninFlow) {
                    this.logger.log(`Using transparent interaction flow for login interaction: ${interactionDetails.uid}`, CasLogLevel.DEBUG);
                    interactionStep = PathUtils.buildInteractionPath(PathUtils.buildPath(false,
                        CasInteractionsConstants.prefix, CasInteractionsConstants.loginPath), interactionDetails.uid);
                }
                this.logger.log(`Redirecting to login: ${interactionStep}`, CasLogLevel.DEBUG);
                PathUtils.redirectResponse(resp, interactionStep);
            }
            else if (interactionDetails.prompt.name === OIDC_INTERACTION.CONSENT) {
                let interactionStep: string = PathUtils.addQueryParams(PathUtils.buildInteractionPath(
                    PathUtils.buildPath(false, this.consentPath), interactionDetails.uid),
                    [{
                        name: 'client',
                        value: ObjUtils.fetchField<string>(interactionDetails, ['params', 'client_id'], "unknown")
                    },
                    {
                        name: 'scopes',
                        value: ObjUtils.fetchField<Array<string>>(interactionDetails.prompt, ['details', 'scopes', 'new'], []).join(',')
                    }
                    ]);
                if (this.transparentConsentFlow) {
                    this.logger.log(`Using transparent interaction flow for consent interaction: ${interactionDetails.uid}`, CasLogLevel.DEBUG);
                    interactionStep = PathUtils.buildInteractionPath(PathUtils.buildPath(false,
                        CasInteractionsConstants.prefix, CasInteractionsConstants.confirmPath), interactionDetails.uid);
                }
                this.logger.log(`Redirecting to consent: ${interactionStep}`, CasLogLevel.DEBUG);
                PathUtils.redirectResponse(resp, interactionStep);
            }               
        }
    }
}