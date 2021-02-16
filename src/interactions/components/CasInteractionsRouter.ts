import {HTTP_METHOD, EndPointConfig, CasRouter} from '../../routing/components/CasRouter';
import { ICasDb } from '../../db/interfaces/ICasDb';
import { ICasLogger } from '../../logging/interfaces/ICasLogger';
import { CasInteractionsHandler } from '../handlers/CasInteractionsHandler'; 
import { CasHandler } from '../../common/CasHandler';

export class CasInteractionsRouter extends CasRouter {

    constructor(db: ICasDb, logger: ICasLogger) {
        super(db, logger);
    }

    protected getRouteDefinitions(): Array<EndPointConfig> {
        const signinPath = '/:uid/login';
        const abortPath = '/:uid/abort';
        return [
            {
                apipath: '/:uid',
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasInteractionsHandler(this.db, this.logger, signinPath, abortPath).getHandle()
                ]
            },
            {
                apipath: signinPath,
                httpMethod: HTTP_METHOD.GET,
                handlers: [
                    CasHandler.disableCache, 
                    new CasInteractionsHandler(this.db, this.logger, signinPath, abortPath).getHandle()
                ]
            }
        ];
    }
}