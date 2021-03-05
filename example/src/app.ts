import { CertAssert, CertAssertConfig, CasLogLevel } from '../../src/index';
import fs from 'fs';
import path from 'path';

const config:CertAssertConfig = {
    acceptedCAs: ['test/integration/gen/cert/ca/CertAssertLocalCA.pem'],
    serverCertificatePath: './test/integration/gen/cert/server/certassertServerCert.pem',
    serverCertificateKeyPath: './test/integration/gen/cert/server/certassertServerCert.key',
    oidcIssuer: 'https://lvh.me',
    httpRedirectPort: 8080,
    securePort: 9443,
    logLevel: CasLogLevel.DEBUG,
    cookieKeys: ['a393f7c7d23b'],
    webKeys: [fs.readFileSync(path.resolve(__dirname, '..', '..', 'test', 'integration', 'gen', 'cert', 'signing', 'certassertSigningKey.key')).toString('utf-8')],
    clients: [
        {
            client_id: 'cert-assert-example-client-app',
            grant_types: ['implicit', 'authorization_code'],
            response_types: ['id_token', 'code'],
            redirect_uris: ['https://lvh.me:3000'],
            post_logout_redirect_uris: ['https://lvh.me:3000'],
            token_endpoint_auth_method: 'none'
        }
    ],
    transparentInteractionFlows: {
        signinPath: false,
        errorPath: false,
        consentPath: false,
        logoutPath: false
    }
}
new CertAssert(config).init();   
