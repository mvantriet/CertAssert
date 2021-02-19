import { Router } from 'express';
import { ICasRouter } from '../interfaces/ICasRouter';
import { ICasLogger, CasLogLevel } from '../../logging/interfaces/ICasLogger';
import { ICasRouteHandle } from '../interfaces/ICasApiHandler';
import { CasHandler } from '../../common/CasHandler';
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasOidcInteractionsProvider } from '../../oidc/interfaces/ICasOidcInteractionsProvider';

export enum HTTP_METHOD {
    GET,
    POST
}

export type EndPointConfig = {
    apipath: string,
    httpMethod: HTTP_METHOD,
    handlers: Array<ICasRouteHandle>,
}

export abstract class CasRouter extends CasHandler implements ICasRouter {

    protected interactionsProvider: ICasOidcInteractionsProvider;
    protected routeDefinitions: Array<EndPointConfig>;

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger);
        this.interactionsProvider = interactionsProvider;
    }

    public toRouter(): Router {
        const out: Router = Router();
        this.routeDefinitions.forEach((routeDefinition: EndPointConfig) => {
            switch (routeDefinition.httpMethod) {
                case HTTP_METHOD.GET:
                    out.get(routeDefinition.apipath, routeDefinition.handlers);
                    break;
                case HTTP_METHOD.POST:
                    out.post(routeDefinition.apipath, routeDefinition.handlers);
                    break;
                default:
                    this.logger.log('Unsupported HTTP method for route configuration', CasLogLevel.CRITICAL);
                    break;
            }
            this.logger.log(`Registered route for: ${routeDefinition.apipath}`, CasLogLevel.DEBUG)
        })
        return out;
    }

    protected abstract getRouteDefinitions(): Array<EndPointConfig>;
}