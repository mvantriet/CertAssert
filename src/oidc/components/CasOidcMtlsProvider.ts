import fs from 'fs';
import * as http from 'http';
import * as http2 from 'http2';
import { Provider } from 'oidc-provider';
import { ICasOidcProvider } from '../interfaces/ICasOidcProvider';
import { x509Jwk } from '../config/CasOidcConfig';
import { CertificateUtils } from '../../utils/CertificateUtils';
const jose = require('node-jose');

export class CasOidcMtlsProvider implements ICasOidcProvider {

    private issuer: string;
    private caKey: string;
    private caCert: string;
    private provider: Provider;

    constructor(issuer: string, caCertPath: string, caKeyPath: string) {
        this.issuer = issuer;
        this.caCert = fs.readFileSync(CertificateUtils.normaliseCert(caCertPath)).toString();
        this.caKey = fs.readFileSync(CertificateUtils.normaliseKey(caKeyPath)).toString();
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
                  enabled: true }, // defaults to false
                revocation: { enabled: true }, // defaults to false
            },
            ttl: {
                AccessToken: 8 * 60 * 60,
                AuthorizationCode: 360,
                IdToken: 8 * 60 * 60,
                DeviceCode: 360,
                RefreshToken: 5 * 24 * 60 * 60
            },
            clients: [{
                grant_types: [
                    "urn:ietf:params:oauth:grant-type:device_code"
                ],
                response_types: [],
                token_endpoint_auth_method: "self_signed_tls_client_auth",
                client_id: "0X33oJQ3Se_lLiQluw2UJ",
                jwks: {
                    keys: [
                        this.toX509Jwk()
                    ]
                },
                redirect_uris: []
            }]
        });
    }

    private toX509Jwk(): x509Jwk {
        const { e, kty, n } = jose.JWK.asKey(this.caKey).toJWK();
        return {
            e: e,
            kty: kty,
            n: n,
            x5c: [
                this.caCert
            ]
        }
    }

}