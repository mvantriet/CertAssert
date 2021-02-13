// Imports
import express from 'express'
import * as core from 'express-serve-static-core';
import { Provider } from 'oidc-provider';
import helmet from 'helmet';
import compression from "compression";
const cors = require('cors');
import { ICasServer } from './server/interfaces/ICasServer';
import { CasServer } from './server/components/CasServer';
import { ICasLogger, CasLogLevel } from './logging/interfaces/ICasLogger';
import { CasLogger } from './logging/components/CasLogger';
import { ICasRouter } from './routing/interfaces/ICasRouter';
import { CasApiRouter } from './api/components/CasApiRouter';
import { CasInteractionsRouter } from './interactions/components/CasInteractionsRouter';
import { ICasOidcProvider } from './oidc/interfaces/ICasOidcProvider';
import { CasOidcMtlsProvider } from './oidc/components/CasOidcMtlsProvider';
// Import type definitions
import './dataAdaptation/networking/types/CasNetworkingTypes';
import { ICasDb } from './db/interfaces/ICasDb';
import { CasDbInMem } from './db/components/CasDbInMem';
// Exports for external config
export { CasLogLevel } from './logging/interfaces/ICasLogger';

export type CertAssertConfig = {
    serverCertificatePath: string;
    serverCertificateKeyPath: string;
    acceptedCAs: Array<string>;
    securePort: number,
    httpRedirectPort: number,
    logLevel: CasLogLevel,
    oidcIssuer: string
}

export class CertAssert {

    private app: core.Express;
    private server: ICasServer;
    private logger: ICasLogger;
    private router: ICasRouter;
    private interactions: CasInteractionsRouter;
    private oidc: ICasOidcProvider;
    private db: ICasDb;

    constructor(config: CertAssertConfig) {
        this.app = express();
        this.oidc = new CasOidcMtlsProvider(`https://localhost:${config.securePort}`, './test/integration/gen/cert/ca/CertAssertLocalCA.pem', './test/integration/gen/cert/ca/CertAssertLocalCA.key');
        this.logger = new CasLogger(config.logLevel);
        this.db = new CasDbInMem(this.logger);
        this.router = new CasApiRouter(this.db, this.logger);
        this.interactions = new CasInteractionsRouter(this.db, this.logger);
        this.server = new CasServer(config.serverCertificateKeyPath, config.serverCertificatePath, config.acceptedCAs,
                                        this.app, config.securePort, config.httpRedirectPort, this.logger);
    }

    init(): void {
        this.logger.log('Initiating CertAssert');
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(express.static("public"));
        this.app.use('/api', this.router.toRouter());
        this.app.use("/interactions", this.interactions.toRouter());
        this.app.use(this.oidc.getCallback());
        this.server.init();
    }
} 
