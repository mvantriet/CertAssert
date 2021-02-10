export type ResponseType = 'id_token' | 'code' | 'refresh_token';
export type TokenEndPointAuthMethod = 'none' | 'client_secret_post' | 'self_signed_tls_client_auth';
export type GrantType = 'implicit' | 'authorization_code' | 'client_credentials' | 'urn:ietf:params:oauth:grant-type:device_code';

export type ClientConfig = {
    client_id: string,
    grant_types: Array<GrantType>,
    response_types: Array<ResponseType>,
    redirect_uris: Array<string>,
    client_secret?: string, // not required for implicit and pixy
    post_logout_redirect_uris?: Array<string>,
    token_endpoint_auth_method?: TokenEndPointAuthMethod
}

export type CookieConfig = {
    signed: boolean,
    maxAge: number // ms
}

export type CookiesConfig = {
    long: CookieConfig,
    short: CookieConfig,
    keys: Array<string>
}

export type ClaimsConfig = {
    email?: Array<string>,
    profile: Array<string>
}

export type FeatureToggle = {
    enabled: boolean,
    allowedPolicy?: (context: any, client: any, token: any) => boolean;
}

export type FeaturesConfig = {
    devInteractions?: FeatureToggle,
    deviceFlow?: FeatureToggle,
    clientCredentials?: FeatureToggle,
    introspection?: FeatureToggle,
    revocation?: FeatureToggle
}

export type Jwk = {
    kty: "RSA",
    e: string,
    n: string
}

export type x509Jwk = Jwk & {
    x5c: Array<string>
}

export type TokenTTL = {
    AccessToken: number // seconds
    AuthorizationCode: number // seconds
    IdToken: number // seconds
    DeviceCode: number // seconds
    RefreshToken: number // seconds
}

export type JwksConfig = {
    keys: Array<x509Jwk>,
    ttl: TokenTTL
}

export type OidcConfig = {
    clients: Array<ClientConfig>,
    cookies: CookiesConfig,
    claims: ClaimsConfig,
    features: FeaturesConfig,
    jwks: JwksConfig
}