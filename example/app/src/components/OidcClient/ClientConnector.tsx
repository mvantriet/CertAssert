import React from "react";
import ClientConnectorStyled from "./ClientConnector.styled";
import axios, {AxiosResponse} from "axios";
import { OidcClient, 
    SigninRequest, 
    SignoutRequest, 
    SigninResponse, 
    SignoutResponse} from 'oidc-client';

import "spectre.css";

export type ClientConnectorProps = {
}

interface ClientConnectorState {
  serverUp: boolean,
  signedIn: boolean,
  signedOut: boolean,
  idtoken?: string,
  accesstoken?: string,
  user?: {
    sub?: string,
    CN?: string,
    C?: string,
    O?: string,
    OU?: string,
    ST: string,
    L?: string,
    emailAddress?: string
  }
}

export class ClientConnector extends React.Component<ClientConnectorProps, ClientConnectorState> {

  private oidcClient: OidcClient;
  private reqState: string;

  constructor(props: ClientConnectorProps) {
    super(props);
    this.state = {
      serverUp: false,
      signedIn: false,
      signedOut: false
    }
    this.oidcClient = new OidcClient({
        authority: 'https://lvh.me:9443/oidc',
        client_id: 'cert-assert-example-client-app',
        redirect_uri: 'https://lvh.me:3000',
        post_logout_redirect_uri: 'https://lvh.me:3000',
        response_type: 'code',
        scope: 'openid profile email',
        filterProtocolClaims: true,
        loadUserInfo: true
    });
    // Use as a constant, naturally in practice use something that varies..session of user etc
    this.reqState = 'CERTASSERT_E2E';
  }

  redirect(url: string, waitTime?: number): void {
    if (waitTime) {
      setTimeout(() => {
        window.location.href = url;
      }, waitTime)
    } else {
      window.location.href = url;
    }
  }

  dnStr(rawIn: any): string {
    let out = '';
    const sep = '/';
    ['CN', 'O', 'L', 'OU', 'C', 'ST', 'emailAddress', 'E'].forEach((dnAttr: string) => {
      if (rawIn[dnAttr]) {
        if (out !== '') {
          out = out + sep;
        }
        out = out + dnAttr + '=' + rawIn[dnAttr];
      }
    })
    return out;
  }

  log(msg: any): void {
    const logBox: HTMLElement | null = document.getElementById("raw-requests-responses");
    if (logBox) {
      if (typeof msg === "string") {
        logBox.innerHTML = msg;
      } else if (typeof msg === "object") {
        logBox.innerHTML = JSON.stringify(msg, null, 1);
      }
    }
  } 

  async updateServerState(): Promise<void> {
    try {
      const res: AxiosResponse = await axios.get('https://lvh.me:9443/oidc/.well-known/openid-configuration');
      this.setState({serverUp: res.status === 200});
    } catch(err) {}  
  }

  async login(): Promise<void> {
    try {
      const req: SigninRequest = await this.oidcClient.createSigninRequest({ state: this.reqState });
      this.log('Redirecting to CertAssert as outlined below in 3 SECONDS\n\n' + JSON.stringify(req, null, 1));
      this.redirect(req.url, 3000);
    } catch(err) {
      this.log(`Failed to create signin request: ${err.toString()}`)
    }
  }

  async logout(): Promise<void> {
    try {
      const req: SignoutRequest = await this.oidcClient.createSignoutRequest({ state: this.reqState, id_token_hint: this.state.idtoken });
      this.log('Redirecting to CertAssert as outlined below in 3 SECONDS\n\n' + JSON.stringify(req, null, 1));
      this.redirect(req.url, 3000);
    } catch(err) {
      this.log(`Failed to create signout request: ${err.toString()}`)
    }
  }

  async componentDidMount(): Promise<void> {
    if (window.location.href.indexOf('?code') > -1) {
      try {
        const res: SigninResponse = await this.oidcClient.processSigninResponse();
        this.log('Processed signin response\n\n' + JSON.stringify(res, null, 1));
        if (res.state === this.reqState) {
          this.setState({signedIn: true, signedOut: false, user: res.profile, idtoken: res.id_token, accesstoken: res.access_token});
        }
      } catch(err) {
        this.log(err);
      }
    } else if (window.location.href.indexOf('?state') > -1) {
      try {
        const res: SignoutResponse = await this.oidcClient.processSignoutResponse();
        if (res.state === this.reqState) {
          this.log('Processed signout response\n\n' + JSON.stringify(res, null, 1));
          this.setState({signedIn: false, signedOut: true, user: undefined});  
        }
      } catch(err) {
        this.log(err);
      }
    } else if (window.location.href.indexOf('?error') > -1) {
      this.log('Sure you installed the client certificate in your browser?\n\n' + JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search.substring(1)))));
    }

    this.updateServerState();

    setInterval(this.updateServerState, 3000);
  }

  render() {
    return (
      <ClientConnectorStyled>
        <div className="container grid-lg p-centered">
          <div className="columns">
            <div className="column col-3" />
            <div className="column col-7">
              <h4>{"> CertAssert / E2E"}</h4>
              <div>
                <div className={"app-details"}>
                  <div className={"app-precondition-label"}>
                  <b>PRECONDITIONS:</b>
                  </div>
                  <div className={"app-precondition-label"}>
                    <b>1</b>. Install the client certificate file (see below for path; no password) into your browser in order to successfully signin. Browser instructions: <a href="https://support.globalsign.com/digital-certificates/digital-certificate-installation/install-client-digital-certificate-windows-using-chrome">Chrome</a>, <a href="https://support.globalsign.com/digital-certificates/digital-certificate-installation/install-client-digital-certificate-firefox-windows">Firefox</a>, <a href="https://www.digicert.com/kb/managing-client-certificates.htm">Safari</a>
                  </div>
                  <div className={"app-precondition-label"}>
                    <b>2</b>. Ensure the example server is running on port 9443 -- npm run start:e2e
                  </div>
                  <div className={"app-precondition-label"}>
                    <b>3</b>. Truste the self-signed server domain certificate used for dev by visiting the backend server running on port 9443 at least once through the browser, <a href="https://lvh.me:9443">click here</a>.
                  </div>
                  <div className={"horizontal-divider"} />
                  <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"Client Cert path:"}
                          </div>
                          <div className={"column col-auto"}>
                            <i>test/integration/gen/cert/ca/CertAssertLocalClientCert.pfx</i>
                          </div>
                          <div className={"column col-4"} />
                    </div>
                    <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"Server Reachable:"}
                          </div>
                          <div className={"column col-auto"}>
                            <div className={this.state.serverUp ? "bin-label-yes" : "bin-label-no"}>{this.state.serverUp ? "YES" : "NO"}</div>
                          </div>
                    </div>
                    <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"Signed In:"}
                          </div>
                          <div className={"column col-auto"}>
                            <div className={this.state.signedIn ? "bin-label-yes" : "bin-label-no"}>{this.state.signedIn ? "YES" : "NO"}</div>
                          </div>
                    </div>
                    <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"User:"}
                          </div>
                          <div className={"column col-auto"}>
                            <b>{this.state.user ? this.dnStr(this.state.user) : "Not signed in"}</b>
                          </div>
                    </div>
                </div>
                <div className="action-buttons">
                      <div className="columns">
                        <div className="column col-4" />
                        <div className="column col-5">
                              <div className="columns">
                                <div className="column col-auto">
                                  <button id="signin-btn" className="btn btn-primary" autoFocus={true}
                                    onClick={this.login.bind(this)}
                                    >Sign In</button>
                                </div>
                                <div className="divider-vert" data-content="OR">a</div>
                                <div className="column col-auto">
                                  <button id="signout-btn" className="btn"
                                    onClick={this.logout.bind(this)}                                    
                                  >Sign Out</button>
                                </div>
                              </div>
                        </div>
                      </div>
                </div>
                <div className={"horizontal-divider"} />
                <div className={"app-precondition-label"}>
                  Log
                </div>
                <pre className="code" data-lang="JSON"><code id="raw-requests-responses"></code></pre>
              </div>
            </div>
        </div>
        </div>
      </ClientConnectorStyled>);
  }
}

export default ClientConnector;