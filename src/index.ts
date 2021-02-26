// Imports
import express from 'express';
import path from 'path';
import * as core from 'express-serve-static-core';
import compression from "compression";
const cors = require('cors');
import { ICasServer } from './server/interfaces/ICasServer';
import { CasServer } from './server/components/CasServer';
import { ICasLogger, CasLogLevel } from './logging/interfaces/ICasLogger';
import { CasLogger } from './logging/components/CasLogger';
import { ICasRouter } from './routing/interfaces/ICasRouter';
import { CasApiRouter } from './api/components/CasApiRouter';
import { CasInteractionsRouter } from './interactions/components/CasInteractionsRouter';
import { CasOidcMtlsProvider } from './oidc/components/CasOidcMtlsProvider';
import { CasDataAdaptationHandler } from './dataAdaptation/handlers/CasDataAdaptionHandler';
import { CasCertChainVerifyHandler } from './dataAdaptation/handlers/CasCertChainVerifyHandler';
// Import type definitions
import './dataAdaptation/networking/types/CasNetworkingTypes';
import { ICasDb } from './db/interfaces/ICasDb';
import { CasDbInMem } from './db/components/CasDbInMem';
// Exports for external config
export { CasLogLevel } from './logging/interfaces/ICasLogger';
import { CasApiConstants } from './api/constants/CasApiConstants';
import { CasInteractionsConstants} from './interactions/constants/CasInteractionsConstants';
import { InteractionsStaticConstants } from './interactions/static/src/constants/InteractionsStaticConstants';
import { CertificateUtils } from './utils/CertificateUtils';

export type CertAssertConfig = {
    serverCertificatePath: string;
    serverCertificateKeyPath: string;
    acceptedCAs: Array<string>;
    securePort: number,
    httpRedirectPort: number,
    logLevel: CasLogLevel,
    oidcIssuer: string,
    cookieKeys: Array<string>,
    webKeys: Array<string>
}

export class CertAssert {

    private config: CertAssertConfig;
    private app: core.Express;
    private server: ICasServer;
    private logger: ICasLogger;
    private router: ICasRouter;
    private interactions: CasInteractionsRouter;
    private oidcProvider: CasOidcMtlsProvider;
    private db: ICasDb;

    constructor(config: CertAssertConfig) {
        this.config = config;
        this.app = express();
        this.logger = new CasLogger(config.logLevel);
        this.db = new CasDbInMem(this.logger);
        this.oidcProvider = new CasOidcMtlsProvider(`https://localhost:${config.securePort}`, 
            this.db, InteractionsStaticConstants.logoutPath, InteractionsStaticConstants.errorPath,
            config.cookieKeys, config.webKeys);
        this.router = new CasApiRouter(this.db, this.logger, this.oidcProvider);
        this.interactions = new CasInteractionsRouter(this.db, this.logger, this.oidcProvider);
        this.server = new CasServer(config.serverCertificateKeyPath, config.serverCertificatePath, config.acceptedCAs,
                                        this.app, config.securePort, config.httpRedirectPort, this.logger);

    }

    init(): void {
        this.logger.log('Initiating CertAssert');
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(compression());
        this.app.use(new CasDataAdaptationHandler(this.db, this.logger).getHandle());
        this.app.use(new CasCertChainVerifyHandler(this.db, this.logger, 
            CertificateUtils.inputAdaptCertArray(this.config.acceptedCAs)).getHandle());
        this.app.use(CasApiConstants.prefix, this.router.toRouter());
        this.app.use(express.static(path.join(__dirname, 'interactions', 'static', 'build')))
        this.app.use(CasInteractionsConstants.prefix, this.interactions.toRouter());
        this.oidcProvider.init().then(() => {
            this.app.use('/oidc', this.oidcProvider.getCallback());
            this.app.get('/*', (_req, res) => res.sendFile(path.join(__dirname, 'interactions', 'static', 'build', 'index.html')));
            this.server.init();    
        })
    }
}