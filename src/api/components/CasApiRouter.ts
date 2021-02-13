import { ICasLogger } from '../../logging/interfaces/ICasLogger';
import { CasAuthHandler } from '../../api/handlers/CasAuthHandler';
import { CasWhoAmIHandler } from '../../api/handlers/CasWhoAmIHandler';
import { CasListHandler } from '../../api/handlers/CasListHandler';
import { ICasDb } from '../../db/interfaces/ICasDb';
import {HTTP_METHOD, EndPointConfig, CasRouter} from '../../routing/components/CasRouter';

export class CasApiRouter extends CasRouter {

    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    protected getRouteDefinitions(): Array<EndPointConfig> {
        return [
        {
            apipath: '/auth',
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasAuthHandler(this.db, this.logger).handle]
        },
        {
            apipath: '/whoami',
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasWhoAmIHandler(this.db, this.logger).handle]
        },
        {
            apipath: '/list',
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasListHandler(this.db, this.logger).handle]
        }
        ]
    }
}