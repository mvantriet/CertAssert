// Imports
import express from 'express'
import * as core from 'express-serve-static-core';
import { ICasServer } from './server/interfaces/ICasServer';
import { CasServer } from './server/components/CasServer';
import { ICasLogger, CasLogLevel } from './logging/interfaces/ICasLogger';
import { CasLogger } from './logging/components/CasLogger';
import { ICasRouter } from './routing/interfaces/ICasRouter';
import { CasRouter } from './routing/components/CasRouter';
// Import type definitions
import './dataAdaptation/networking/types/CasNetworkingTypes';

// Exports for external config
export { CasLogLevel } from './logging/interfaces/ICasLogger';

export type CertAssertConfig = {
    serverCertificatePath: string;
    serverCertificateKeyPath: string;
    acceptedCAs: Array<string>;
    securePort: number,
    httpRedirectPort: number,
    logLevel: CasLogLevel
}

export class CertAssert {

    private app: core.Express;
    private server: ICasServer;
    private logger: ICasLogger;
    private router: ICasRouter;

    constructor(config: CertAssertConfig) {
        this.app = express();
        this.logger = new CasLogger(config.logLevel);
        this.router = new CasRouter(this.logger);
        this.server = new CasServer(config.serverCertificateKeyPath, config.serverCertificatePath, config.acceptedCAs,
                                        this.app, config.securePort, config.httpRedirectPort, this.logger);
    }

    init(): void {
        this.logger.log('Initiating CertAssert');
        this.app.use(express.json());
        this.app.use('/api', this.router.toExpressRouter());
        this.server.init();
    }
} 
