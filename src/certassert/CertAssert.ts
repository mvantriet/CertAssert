// Imports
import express from 'express';
import path from 'path';
import * as core from 'express-serve-static-core';
import compression from "compression";
import { ClientMetadata } from "oidc-provider";
const cors = require('cors');
import { ICasServer } from '../server/interfaces/ICasServer';
import { CasServer } from '../server/components/CasServer';
import { ICasLogger, CasLogLevel } from '../logging/interfaces/ICasLogger';
import { CasLogger } from '../logging/components/CasLogger';
import { ICasRouter } from '../routing/interfaces/ICasRouter';
import { CasApiRouter } from '../api/components/CasApiRouter';
import { CasInteractionsRouter } from '../interactions/components/CasInteractionsRouter';
import { CasOidcMtlsProvider } from '../oidc/components/CasOidcMtlsProvider';
import { CasDataAdaptationHandler } from '../dataAdaptation/handlers/CasDataAdaptionHandler';
import { CasCertChainVerifyHandler } from '../dataAdaptation/handlers/CasCertChainVerifyHandler';
// Import type definitions
import '../dataAdaptation/networking/types/CasNetworkingTypes';
import { ICasDb } from '../db/interfaces/ICasDb';
import { CasDbInMem } from '../db/components/CasDbInMem';
// Exports for external config
export { CasLogLevel } from '../logging/interfaces/ICasLogger';
import { CasApiConstants } from '../api/constants/CasApiConstants';
import { CasInteractionsConstants} from '../interactions/constants/CasInteractionsConstants';
import { InteractionsStaticConstants } from '../interactions/static/src/constants/InteractionsStaticConstants';
import { CertificateUtils } from '../utils/CertificateUtils';

export enum INTERACTION_PATH {
    SIGNIN="signinPath",
    CONTENT="consentPath",
    ERROR="errorPath",
    LOGOUT="logoutPath"
}

export type InteractionPaths = {
    [interaction in INTERACTION_PATH]: string;
}

export type TransparentInteractionFlowToggles = {
    [interaction in INTERACTION_PATH]: boolean
}

export type CertAssertConfig = {
    serverCertificatePath: string;
    serverCertificateKeyPath: string;
    acceptedCAs: Array<string>;
    securePort: number,
    httpRedirectPort: number,
    logLevel: CasLogLevel,
    oidcIssuer: string,
    cookieKeys: Array<string>,
    webKeys: Array<string>,
    clients: Array<ClientMetadata>,
    interactionPaths?: InteractionPaths,
    transparentInteractionFlows?: TransparentInteractionFlowToggles
}

type ConfigVerificationResult = {
    result: boolean,
    details?: string
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
    private interactionPaths: InteractionPaths;

    constructor(config: CertAssertConfig) {
        this.config = config;
        this.logger = new CasLogger(config.logLevel);
        const configVerification: ConfigVerificationResult = this.verifyConfig(config);
        if (!configVerification.result) {
            this.logger.log(`Config verification failed. Stopped launch. Reason: ${configVerification.details as string}`, CasLogLevel.CRITICAL);
            process.exit(1);
        }
        this.app = express();
        this.interactionPaths = (config.interactionPaths) ? config.interactionPaths : InteractionsStaticConstants;
        this.db = new CasDbInMem(this.logger);
        this.oidcProvider = new CasOidcMtlsProvider(this.logger, this.config.oidcIssuer, 
            this.db, this.config.clients, this.interactionPaths.logoutPath, this.interactionPaths.errorPath, 
            this.isTransparentFlow(INTERACTION_PATH.LOGOUT, config.transparentInteractionFlows),
            config.cookieKeys, config.webKeys);
        this.router = new CasApiRouter(this.db, this.logger, this.oidcProvider);
        this.interactions = new CasInteractionsRouter(this.db, this.logger, this.oidcProvider,
            this.interactionPaths.signinPath, this.interactionPaths.consentPath, 
            this.isTransparentFlow(INTERACTION_PATH.SIGNIN, config.transparentInteractionFlows),
            this.isTransparentFlow(INTERACTION_PATH.CONTENT, config.transparentInteractionFlows));
        this.server = new CasServer(config.serverCertificateKeyPath, config.serverCertificatePath, config.acceptedCAs,
                                        this.app, config.securePort, config.httpRedirectPort, this.logger);

    }

    init(): void {
        this.logger.log('Initiating CertAssert');
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(compression());
        this.app.use(new CasDataAdaptationHandler(this.db, this.logger).getHandle());
        this.app.use(new CasCertChainVerifyHandler(this.db, this.logger, 
            CertificateUtils.inputAdaptCertArray(this.config.acceptedCAs)).getHandle());
        this.app.use(CasApiConstants.prefix, this.router.toRouter());
        if (this.config.interactionPaths === undefined) {
            this.logger.log(`TransparentFlows turned off, and no custom interactionPaths are defined in the config -> using default interactions`, CasLogLevel.INFO);
            this.app.use(express.static(path.resolve(__dirname, '..', 'interactions', 'static', 'build')))
        }
        this.app.use(CasInteractionsConstants.prefix, this.interactions.toRouter());
        this.oidcProvider.init().then(() => {
            this.app.use('/oidc', this.oidcProvider.getCallback());
            if (this.config.interactionPaths === undefined) {
                // Needs to be configured lastly
                this.app.get('/*', (_req, res) => res.sendFile(path.resolve(__dirname, '..', 'interactions', 'static', 'build', 'index.html')));
            }
            this.server.init();    
        })
    }

    private verifyConfig(config: CertAssertConfig): ConfigVerificationResult {
        const out: ConfigVerificationResult = {
            result: true
        }

        if (config.transparentInteractionFlows && config.interactionPaths) {
            out.result = false;
            out.details = `It does not make sense to define custom interactionPaths and also define transparentInteractionFlows, 
            which basically means no user interactions. Please turn transparentInteractionFlows off (false) or do not define any
            custom interactionPaths.`;
        }
        // TODO :: More config verification checks
        return out;
    }

    private isTransparentFlow(interaction: INTERACTION_PATH, toggles?: TransparentInteractionFlowToggles): boolean {
        return toggles ? toggles[interaction] : false;
    }
}