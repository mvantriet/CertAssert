import express from 'express'
import * as core from 'express-serve-static-core';
import { ICasServer } from './server/interfaces/ICasServer';
import { CasServer } from './server/components/CasServer';

export class CertAssert {

    private app: core.Express;
    private server: ICasServer;

    constructor() {
        this.app = express();
        this.server = new CasServer('./tests/integration/gen/cert/server/certassertServerCert.key', './tests/integration/gen/cert/server/certassertServerCert.pem', ['./tests/integration/gen/cert/ca/CertAssertLocalCA.pem'],
                                        this.app, 8443, 8080);
    }

    init(): void {
        this.initRoutes();
        this.server.init();
    }

    private initRoutes(): void {
        this.app.get( "/api/auth", ( req: any, res: any ) => {
            return res.status(200).send({ result: req.client.authorized, token: 'test' });
        } );
    }
} 
