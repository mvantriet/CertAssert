import { CertAssert, CertAssertConfig, CasLogLevel } from '../../src/index';

const config:CertAssertConfig = {
    acceptedCAs: ['./test/integration/gen/cert/ca/CertAssertLocalCA.pem'],
    serverCertificatePath: './test/integration/gen/cert/server/certassertServerCert.pem',
    serverCertificateKeyPath: './test/integration/gen/cert/server/certassertServerCert.key',
    oidcIssuer: 'http://localhost',
    httpRedirectPort: 8080,
    securePort: 8443,
    logLevel: CasLogLevel.DEBUG
}

new CertAssert(config).init();