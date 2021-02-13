import fs from 'fs';
import * as http from 'http';
import * as http2 from 'http2';
import { Provider } from 'oidc-provider';
import { ICasOidcProvider } from '../interfaces/ICasOidcProvider';
import { CertificateUtils } from '../../utils/CertificateUtils';
import jose, { JSONWebKey } from 'jose';

export class CasOidcMtlsProvider implements ICasOidcProvider {

    private issuer: string;
    private signKey: Buffer;
    private signCert: Buffer;
    private provider: Provider;

    constructor(issuer: string, signCertPath: string, signKeyPath: string) {
        this.issuer = issuer;
        this.signCert = fs.readFileSync(signCertPath);
        this.signKey = fs.readFileSync(signKeyPath);
        this.provider = this.init();
    }

    public getCallback(): (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void {
        return this.provider.callback;
    }

    private init(): Provider {
        return new Provider(this.issuer, {
            cookies: {
                keys: ['a5cfd81d8c'],
                long: { signed: true, maxAge: (5 * 24 * 60 * 60) * 1000 },
                short: { signed: true, maxAge: (1 * 60 * 60) * 1000 }
            },
            claims: {
                email: ['email'],
                profile: ['CN', 'O', 'OU', 'L', 'C', 'S'],
            },
            features: {
                devInteractions: { enabled: false }, // defaults to true
                deviceFlow: { enabled: true }, // defaults to false
                clientCredentials: {enabled: true},
                introspection: { 
                  allowedPolicy: async function introspectionAllowedPolicy(ctx, client, token) {
                    if (client.introspectionEndpointAuthMethod === 'none' && token.clientId !== ctx.oidc.client.clientId) {
                      return false;
                    }
                    return true;
                  },
                  enabled: true },
                revocation: { enabled: true }
            },
            ttl: {
                AccessToken: 8 * 60 * 60,
                AuthorizationCode: 360,
                IdToken: 8 * 60 * 60,
                DeviceCode: 360,
                RefreshToken: 5 * 24 * 60 * 60
            },
            clients: [
            {
                client_id: 'test_implicit_app',
                grant_types: ['implicit', 'authorization_code'],
                response_types: ['id_token', 'code'],
                redirect_uris: ['https://lvh.me:15000/oidc-client-sample.html'],
                post_logout_redirect_uris: ['https://lvh.me:15000/oidc-client-sample.html'],
                token_endpoint_auth_method: 'none'
            }
            ],
            jwks: {
                keys: [
                    this.signCertToWebKey()
                ]
            }
        });
    }

    private signCertToWebKey(): JSONWebKey {
        return jose.JWK.asKey(
            this.signKey, 
            { 
                x5c: [CertificateUtils.normaliseCert(this.signCert.toString('utf-8'))], 
                alg: 'PS256', 
                use: 'sig',
            }
        ).toJWK(true);
    }

}