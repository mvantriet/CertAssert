
import {CasCertificateAdaptation} from '../../../../src/dataAdaptation/certificate/common/CasCommonAdaptor';
test('Should parse PEM', () => {
    const base64Cert: string = `-----BEGIN CERTIFICATE-----
    MIIDfzCCAmegAwIBAgIUYUAUh4gTdvEccaeUrVHfWtBTp9YwDQYJKoZIhvcNAQEL
    BQAwRzETMBEGA1UECgwKQ0VSVEFTU0VSVDEQMA4GA1UEAwwHTE9DQUxDQTEeMBwG
    CSqGSIb3DQEJARYPY2VydEBhc3NlcnQuY29tMB4XDTIxMDEyODIwNDAxNVoXDTIx
    MDUwODIwNDAxNVowRzETMBEGA1UECgwKQ0VSVEFTU0VSVDEQMA4GA1UEAwwHTE9D
    QUxDQTEeMBwGCSqGSIb3DQEJARYPY2VydEBhc3NlcnQuY29tMIIBIjANBgkqhkiG
    9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwP1hS9XxX/Yd9EF4+YsbUv8m/wiC3xwazCXE
    JanoxddvczYRorzeYbS6IYz43Akegu1EBKSVi4I2ULKdAqK6TDrlWWgi5+c7/XVn
    5m2px33LRXxdqD/Uh8djSKPrHpcOmQjHHmfw1Q5NlxXoyiPx04krF7xnnWqbjDUW
    pxbpmrCp7khE/mFvIIL66d4OG11wxMbExEOnI7+yOWhN8l7CRYlDC5jZQg0wi04m
    FMdTax5moShWHHmqzryc0JqkZxat5MXQAe3zYIxJp0XMrV9mwnKk200SO9hxwLd7
    wdgmWbJVmC9k2MUXG0AesgBfeEZXPSVJlayE/Gp0A8/4F0IzmQIDAQABo2MwYTAO
    BgNVHQ8BAf8EBAMCAQYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4EFgQUqDYPNtZk
    YwKbJVjA/QIEZnh4utkwHwYDVR0jBBgwFoAUqDYPNtZkYwKbJVjA/QIEZnh4utkw
    DQYJKoZIhvcNAQELBQADggEBAHAXpr+/eg/fqkpoVgrkkULipkHZXtAS7KG4TwLx
    9WfH9eeD58QHW/4GyfLz1SgbclxD0opsZjHvuIVd80Wk7ghwjoBGrV8AHy0OTE7/
    upL0gt/YQgTrcjcGi5h8r3tAUoicSmGRgfX/IJLoOHsALMtlBtyeN/vSfUfLTRbh
    dUNQ2hSYBB8LNMr+YZqHVRHSOpr5wz6rGGl7nLuOQRK1kejzPEEUGoXyihSKoLY8
    hWZMObcjAZjvNyLATIZbfivkNvNuefT3OOvSgvQVaiMt+hosAkO7lUMPANWzipbu
    zayJXfcaQIdWSaIJdQ9BA6wLBq+CXjFkZ2DXkFEW/qMDHyo=
    -----END CERTIFICATE-----`;

    const inputAdaptation: CasCertificateAdaptation.CertParseResult = CasCertificateAdaptation.Adaptor.fromRaw(Buffer.from(base64Cert));
    expect(inputAdaptation.cert).toBeDefined();
    expect(inputAdaptation.failureDetails).toBeFalsy();
});