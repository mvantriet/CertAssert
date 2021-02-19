import { ICasLogger } from '../../logging/interfaces/ICasLogger';
import { CasApiAuthHandler } from '../../api/handlers/CasApiAuthHandler';
import { CasApiWhoAmIHandler } from '../../api/handlers/CasApiWhoAmIHandler';
import { CasApiListHandler } from '../../api/handlers/CasApiListHandler';
import { ICasDb } from '../../db/interfaces/ICasDb';
import {HTTP_METHOD, EndPointConfig, CasRouter} from '../../routing/components/CasRouter';
import { ICasOidcInteractionsProvider } from '../../oidc/interfaces/ICasOidcInteractionsProvider';
import { CasApiConstants } from '../constants/CasApiConstants';

export class CasApiRouter extends CasRouter {

    constructor(db: ICasDb, logger: ICasLogger, interactionsProvider: ICasOidcInteractionsProvider) {
        super(db, logger, interactionsProvider);
        this.routeDefinitions = this.getRouteDefinitions();
    }

    protected getRouteDefinitions(): Array<EndPointConfig> {
        return [
        {
            apipath: CasApiConstants.authPath,
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasApiAuthHandler(this.db, this.logger).getHandle()]
        },
        {
            apipath: CasApiConstants.whoamiPath,
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasApiWhoAmIHandler(this.db, this.logger).getHandle()]
        },
        {
            apipath: CasApiConstants.listPath,
            httpMethod: HTTP_METHOD.GET,
            handlers: [new CasApiListHandler(this.db, this.logger).getHandle()]
        }
        ]
    }
}