import * as http from 'http';
import * as http2 from 'http2';
import {Request, Response} from 'express';
import { Provider, ClaimsParameterMember, AccountClaims, Account} from 'oidc-provider';
import { ICasOidcProvider } from '../interfaces/ICasOidcProvider';
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails } from '../interfaces/ICasOidcInteractionsProvider';
import * as CasCert from "../../model/CasCert";
import { RequestCasExtensions } from "../../dataAdaptation/networking/types/CasNetworkingTypes";
import * as jose from 'jose';
import { ICasDb } from '../../db/interfaces/ICasDb';
import { CasOidcCacheDb } from '../../db/components/CasOidcCacheDb';

type ClaimCtx = {
    req: {
        cas: RequestCasExtensions
    }
}

export class CasOidcMtlsProvider implements ICasOidcProvider, ICasOidcInteractionsProvider {

    private issuer: string;
    private provider: Provider;
    private db: ICasDb;

    constructor(issuer: string, db: ICasDb) {
        this.issuer = issuer;
        this.db = db;
    }

    public getCallback(): (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void {
        return this.provider.callback;
    }

    public async init(): Promise<void> {
        this.provider = new Provider(this.issuer, {
            cookies: {
                keys: ['a5cfd81d8c'],
                long: { signed: true, maxAge: (5 * 24 * 60 * 60) * 1000 },
                short: { signed: true, maxAge: (1 * 60 * 60) * 1000 }
            },
            claims: {
                profile: [
                    CasCert.DistinguishedNameAttribute["Common Name"],
                    CasCert.DistinguishedNameAttribute.Organisation,
                    CasCert.DistinguishedNameAttribute["Organisation Unit"],
                    CasCert.DistinguishedNameAttribute.Country,
                    CasCert.DistinguishedNameAttribute.Locality,
                    CasCert.DistinguishedNameAttribute.State,
                    CasCert.DistinguishedNameAttribute["Email Address"],
                ],
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
                AccessToken: 24 * 5 * 60 * 60,
                AuthorizationCode: 360,
                IdToken: 24 * 5 * 60 * 60,
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
                    await this.signCertToWebKey()
                ],
            },
            adapter: CasOidcCacheDb,
            findAccount: this.findAccount.bind(this)
        });
    }

    public async getInteractionDetails(req: Request, resp: Response): Promise<CasOidcInteractionDetails> {
        return (await this.provider.interactionDetails(req, resp) as CasOidcInteractionDetails);
    }

    public async finishInteraction(req: Request, resp: Response, result: any, mergeWithLastSubmission: boolean): Promise<void> {
        return await this.provider.interactionFinished(req, resp, result, { mergeWithLastSubmission: mergeWithLastSubmission });
    }

    private findAccount(_ctx: any, sub: string, token: any): Account {
        const findAccount: Account = {
            accountId: sub,
            claims: (_use: string, scope: string, _claims: { [key: string]: null | ClaimsParameterMember }, _rejected: string[]): AccountClaims => {
                const cert: CasCert.Cert = this.db.getCert(sub);
                if (cert && scope.indexOf('profile') > -1) {
                    const out:any = cert.subject;
                    out.sub = sub;
                    return out;
                }
                return {sub: sub};
            }    
        }
        findAccount.claims = findAccount.claims.bind(this);
        return findAccount;
    }

    private async signCertToWebKey(): Promise<jose.JSONWebKey> {
        const rsaKey:jose.JWK.RSAKey = await jose.JWK.generate('RSA', 2048, {alg: 'RS256', use: 'sig'});
        return rsaKey.toJWK(true);
    }

}