import { Router } from 'express';
import { ICasRouter } from '../interfaces/ICasRouter';
import { ICasLogger, CasLogLevel } from '../../logging/interfaces/ICasLogger';
import { ICasApiHandler } from '../../api/interfaces/ICasApiHandler';
import { CasHandler } from '../../common/CasHandler';
import { CasAuthHandler } from '../../api/handlers/CasAuthHandler';
import { CasWhoAmIHandler } from '../../api/handlers/CasWhoAmIHandler';
import { CasListHandler } from '../../api/handlers/CasListHandler';
import { ICasDb } from '../../db/interfaces/ICasDb';

enum HTTP_METHOD {
    GET,
    POST
}

type EndPointConfig = {
    apipath: string,
    httpMethod: HTTP_METHOD,
    handler: ICasApiHandler
}

export class CasRouter extends CasHandler implements ICasRouter {

    private routeDefinitions: Array<EndPointConfig>;

    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
        this.routeDefinitions = this.getRouteDefinitions();
    }

    public toExpressRouter(): Router  {
        const out: Router = Router();
        this.routeDefinitions.forEach((routeDefinition: EndPointConfig) => {
            switch (routeDefinition.httpMethod) {
                case HTTP_METHOD.GET:
                    out.get(routeDefinition.apipath, routeDefinition.handler.handle);
                    break;
                case HTTP_METHOD.POST:
                    out.post(routeDefinition.apipath, routeDefinition.handler.handle);
                    break;
                default:
                    this.logger.log('Unsupported HTTP method for route configuration', CasLogLevel.CRITICAL);
                    break;
            }
            this.logger.log(`Registered route for: ${routeDefinition.apipath}`, CasLogLevel.DEBUG)
        })
        return out;
    }

    private getRouteDefinitions(): Array<EndPointConfig> {
        return [
        {
            apipath: '/auth',
            httpMethod: HTTP_METHOD.GET,
            handler: new CasAuthHandler(this.db, this.logger)
        },
        {
            apipath: '/whoami',
            httpMethod: HTTP_METHOD.GET,
            handler: new CasWhoAmIHandler(this.db, this.logger)
        },
        {
            apipath: '/list',
            httpMethod: HTTP_METHOD.GET,
            handler: new CasListHandler(this.db, this.logger)
        }
        ]
    }
}