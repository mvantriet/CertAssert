import * as http from 'http';
import * as http2 from 'http2';
import {Request, Response} from 'express';
import { Provider, ClaimsParameterMember, AccountClaims, Account, ErrorOut, errors} from 'oidc-provider';
import { ICasOidcProvider } from '../interfaces/ICasOidcProvider';
import { ICasOidcInteractionsProvider, CasOidcInteractionDetails } from '../interfaces/ICasOidcInteractionsProvider';
import * as CasCert from "../../model/CasCert";
import {JWK, JSONWebKey} from 'jose';
import { ICasDb } from '../../db/interfaces/ICasDb';
import { CasOidcCacheDb } from '../../db/components/CasOidcCacheDb';
import { PathUtils } from '../../utils/PathUtils';
import { ICasLogger, CasLogLevel } from '../../logging/interfaces/ICasLogger';


export class CasOidcMtlsProvider implements ICasOidcProvider, ICasOidcInteractionsProvider {

    private issuer: string;
    private provider: Provider;
    private db: ICasDb;
    private logoutPath: string;
    private errorPath: string;
    private transparentInteractionFlowLogout: boolean;
    private cookieKeys: Array<string>;
    private webKeys: Array<string>;
    private ttls: any;
    private logger: ICasLogger;

    constructor(logger: ICasLogger, issuer: string, db: ICasDb, logoutPath: string, errorPath: string,
                transparentInteractionFlowLogout: boolean, cookieKeys:Array<string>, webKeys: Array<string>) {
        this.issuer = issuer;
        this.db = db;
        this.errorPath = errorPath;
        this.logoutPath = logoutPath;
        this.transparentInteractionFlowLogout = transparentInteractionFlowLogout;
        this.cookieKeys = cookieKeys;
        this.webKeys = webKeys;
        this.provider = {} as Provider;
        this.ttls = {
            AccessToken: 24 * 5 * 60 * 60,
            AuthorizationCode: 360,
            IdToken: 24 * 5 * 60 * 60,
            DeviceCode: 360,
            RefreshToken: 5 * 24 * 60 * 60
        };
        this.logger = logger;
    }

    public getCallback(): (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void {
        return this.provider.callback;
    }

    public async init(): Promise<void> {
        this.provider = new Provider(this.issuer, {
            cookies: {
                keys: this.cookieKeys,
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
                    CasCert.DistinguishedNameAttribute.State
                ],
                email: [
                    CasCert.DistinguishedNameAttribute["Email Address"]
                ]
            },
            features: {
                devInteractions: { enabled: false }, // defaults to true
                deviceFlow: { enabled: true }, // defaults to false
                clientCredentials: {enabled: true},
                introspection: { 
                  allowedPolicy: async function introspectionAllowedPolicy(ctx: any, client: any, token: any) {
                    if (client.introspectionEndpointAuthMethod === 'none' && token.clientId !== ctx.oidc.client.clientId) {
                      return false;
                    }
                    return true;
                  },
                  enabled: true },
                revocation: { enabled: true },
                rpInitiatedLogout: {
                    enabled: true,
                    logoutSource: this.logout.bind(this)
                }
            },
            ttl: this.ttls,
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
                keys: this.genWebKeySet(this.webKeys)
            },
            renderError: this.renderError.bind(this),
            adapter: CasOidcCacheDb,
            findAccount: this.findAccount.bind(this)
        });
        (this.provider as any).IdToken.expiresIn = (...args: any[]) => {
            return this.adaptTokenExpiry(args[1].available.sub, 0, this.ttls.IdToken);
        }
        (this.provider as any).AccessToken.expiresIn = (...args: any[]) => {
            return this.adaptTokenExpiry(args[1].accountId, 0, this.ttls.AccessToken);
        }
    }

    public async getInteractionDetails(req: Request, resp: Response): Promise<CasOidcInteractionDetails | undefined> {
        this.logger.log(`Finding interaction details for: ${req.originalUrl}`, CasLogLevel.DEBUG);
        try {
            return await this.provider.interactionDetails(req, resp) as CasOidcInteractionDetails;
        } catch(err) {
            this.logger.log(`Failed to find interaction details for: ${req.originalUrl}`, CasLogLevel.DEBUG);
            PathUtils.redirectResponse(resp, PathUtils.addQueryParams(PathUtils.buildPath(false, this.errorPath),
                [
                    {name: 'reason',value: 'Invalid session'},
                    {name: 'details',value: err.message}]
                ));
            return;
        }
    }

    public async finishInteraction(req: Request, resp: Response, result: any, mergeWithLastSubmission: boolean): Promise<void> {
        try {
            this.logger.log(`Finishing interaction: ${req.originalUrl}`, CasLogLevel.DEBUG);
            return await this.provider.interactionFinished(req, resp, result, { mergeWithLastSubmission: mergeWithLastSubmission });
        } catch(err) {
            this.logger.log(`Failed to finish interaction for: ${req.originalUrl}. Error: ${err.toString()}`, CasLogLevel.DEBUG);
            PathUtils.redirectResponse(resp, PathUtils.addQueryParams(PathUtils.buildPath(false, this.errorPath),
                [
                    {name: 'reason',value: 'Invalid session'},
                    {name: 'details',value: err.message}]
                ));    
        }
    }

    private logout(ctx: any, form: string): void {
        const val: string | undefined = PathUtils.getFormValue(form, 'value');
        if (val) {
            this.logger.log(`Interaction value found in submitted logout form: ${val}`);
            PathUtils.redirectResponse(ctx.res, PathUtils.addQueryParams(PathUtils.buildInteractionPath(
                PathUtils.buildPath(false, this.logoutPath), val),
                [{
                    name: 'confirmedSignOut',
                    value: this.transparentInteractionFlowLogout.toString()
                }]));
        } else {
            this.logger.log(`No value found for interaction in submitted logout form. Redirecting to error page`, CasLogLevel.SEVERE);
            PathUtils.redirectResponse(ctx.res, PathUtils.addQueryParams(PathUtils.buildPath(false, this.errorPath),
                [
                    {name: 'reason',value: 'Invalid interaction'},
                    {name: 'details',value: 'No interaction was found to complete the logout'}]
                ));
            return;
        }
    }

    private renderError(ctx: any, out: ErrorOut, _error: errors.OIDCProviderError | Error): void {
        try {
            PathUtils.redirectResponse(ctx.res, PathUtils.addQueryParams(PathUtils.buildPath(false, this.errorPath),
            [
                {
                    name: 'reason',
                    value: out.error
                },
                {
                    name: 'details',
                    value: out.error_description ? out.error_description : "n/a"
                }
            ]
            ));
        } catch(err) {
            //this.logger.log('Failed to redirect to error page');
        }
    }

    private findAccount(_ctx: any, sub: string, _token: any): Account {
        this.logger.log(`Performing lookup for sub: ${sub}`, CasLogLevel.DEBUG);
        const findAccount: Account = {
            accountId: sub,
            claims: (_use: string, scope: string, _claims: { [key: string]: null | ClaimsParameterMember }, _rejected: string[]): AccountClaims => {
                const cert: CasCert.Cert | undefined = this.db.getCert(sub);
                if (cert) {
                    this.logger.log(`Db lookup for: ${sub} succeeded against cert: ${cert.sha256DigestHex}`, CasLogLevel.DEBUG);
                }
                const out:any = {sub: sub};
                if (cert && scope.indexOf('profile') > -1) {
                    Object.assign(out, cert.subject)
                    if (out.emailAddress) {
                        delete out.emailAddress;
                    }
                }
                if (cert && scope.indexOf('email') > -1) {
                    if (cert.subject.emailAddress) {
                        out.emailAddress = cert.subject.emailAddress;
                    }
                }
                return out;
            }    
        }
        findAccount.claims = findAccount.claims.bind(this);
        return findAccount;
    }

    private genWebKeySet(keys: Array<string>): Array<JSONWebKey> {
        return keys.map((key: string) => JWK.asKey(key).toJWK(true));
    }

    private adaptTokenExpiry(certSha: string, minTimeSec: number, maxTimeSec: number): number {
        const cert:CasCert.Cert | undefined = this.db.getCert(certSha);
        if (cert) {
            this.logger.log(`Clamping token expiry in case the expiry of the certificate: ${cert.validityPeriod.notAfter} is earlier than the now() + maxTokenTime: ${maxTimeSec*1000}`, CasLogLevel.DEBUG);
            return Math.max(Math.min((cert.validityPeriod.notAfter - Date.now())/1000.0, maxTimeSec), 0);
        }
        return minTimeSec;
    }
}