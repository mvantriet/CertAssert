import { CertAssert, CertAssertConfig, CasLogLevel } from '../../src/index';
import fs from 'fs';
import path from 'path';

const config:CertAssertConfig = {
    acceptedCAs: ['test/integration/gen/cert/ca/CertAssertLocalCA.pem'],
    serverCertificatePath: './test/integration/gen/cert/server/certassertServerCert.pem',
    serverCertificateKeyPath: './test/integration/gen/cert/server/certassertServerCert.key',
    oidcIssuer: 'http://localhost',
    httpRedirectPort: 8080,
    securePort: 9443,
    logLevel: CasLogLevel.DEBUG,
    cookieKeys: ['a393f7c7d23b'],
    webKeys: [fs.readFileSync(path.resolve(__dirname, '..', '..', 'test', 'integration', 'gen', 'cert', 'signing', 'certassertSigningKey.key')).toString('utf-8')],
    transparentInteractionFlows: {
        signinPath: false,
        errorPath: false,
        consentPath: false,
        logoutPath: true
    }
}
new CertAssert(config).init();   
