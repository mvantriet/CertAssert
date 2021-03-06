import {HTTP_METHOD, EndPointConfig, CasRouter} from '../../routing/components/CasRouter';
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';
import { CasInteractionsHandler } from '../handlers/CasInteractionsHandler'; 
import { CasLoginInteractionHandler } from '../handlers/CasLoginInteractionHandler';
import { CasContinueInteractionHandler } from '../handlers/CasContinueInteractionHandler';
import { CasConfirmInteractionHandler } from '../handlers/CasConfirmInteractionHandler';
import { CasAbortInteractionHandler } from '../handlers/CasAbortInteractionHandler';
import { CasHandler } from '../../common/CasHandler';
import { ICasOidcInteractionsProvider } from '../../oidc/interfaces/ICasOidcInteractionsProvider';
import { CasInteractionsConstants } from '../constants/CasInteractionsConstants';

export class CasInteractionsRouter extends CasRouter {

    private signinPath: string;
    private consentPath: string;
    private transparentSiginFlow: boolean;
    private transparentConsentFlow: boolean;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider,
        signinPath: string, consentPath: string, transparentSiginFlow: boolean, transparentConsentFlow: boolean) {
        super(db, logger, interactionsProvider);
        this.signinPath = signinPath;
        this.consentPath = consentPath;
        this.transparentSiginFlow = transparentSiginFlow;
        this.transparentConsentFlow = transparentConsentFlow;
        this.routeDefinitions = this.getRouteDefinitions();
    }

    protected getRouteDefinitions(): Array<EndPointConfig> {
        return [
            {
                apipath: CasInteractionsConstants.interactionPath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasInteractionsHandler(this.db, this.logger, this.interactionsProvider, 
                        this.signinPath, this.consentPath, this.transparentSiginFlow, 
                        this.transparentConsentFlow).getHandle()
                ]
            },
            {
                apipath: CasInteractionsConstants.loginPath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasLoginInteractionHandler(this.db, this.logger, this.interactionsProvider).getHandle()
                ]
            },
            {
                apipath: CasInteractionsConstants.confirmPath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasConfirmInteractionHandler(this.db, this.logger, this.interactionsProvider).getHandle()
                ]
            },
            {
                apipath: CasInteractionsConstants.continuePath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasContinueInteractionHandler(this.db, this.logger, this.interactionsProvider).getHandle()
                ]
            },
            {
                apipath: CasInteractionsConstants.abortPath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasAbortInteractionHandler(this.db, this.logger, this.interactionsProvider).getHandle()
                ]
            }
    
        ];
    }
}