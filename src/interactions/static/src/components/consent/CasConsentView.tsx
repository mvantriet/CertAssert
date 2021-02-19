import React from "react";
import CasConsentViewStyled from "./CasConsentView.styled";
import { Cert, ClientCert, DistinguishedNameAttribute } from "../../../../../model/CasCert";
import { CasApiWhoAmiResponse } from "../../../../../api/handlers/CasApiWhoAmIHandler";
import { CasInteractionsConstants } from "../../../../constants/CasInteractionsConstants";
import { CasApiConstants } from "../../../../../api/constants/CasApiConstants";
import { PathUtils} from "../../../../../utils/PathUtils";

import axios, {AxiosResponse} from "axios";
import "spectre.css";

export type CasConsentViewProps = {
  match: {
    params: {
      uid: string
    }
  }
  location: {
    search: string
  }
}

interface CasConsentViewState {
  authorised: boolean,
  scopes?: string,
  client?: string
}

type ReactComponentProps = {
  location: {
    pathname: string
  }
}

export class CasConsentView extends React.Component<CasConsentViewProps, CasConsentViewState> {

  constructor(props: CasConsentViewProps) {
    super(props);
    this.state = {
      authorised: false
    }
  }

  consent(): void {
    const uid:string = (this.props.match.params.uid) ? this.props.match.params.uid : 'invalidUid';
    PathUtils.redirectAgent(PathUtils.buildInteractionPath(PathUtils.buildPath(false, CasInteractionsConstants.prefix, CasInteractionsConstants.confirmPath), uid));
  }

  abort(): void {
    const uid:string = (this.props.match.params.uid) ? this.props.match.params.uid : 'invalidUid';
    PathUtils.redirectAgent(PathUtils.buildInteractionPath(PathUtils.buildPath(false, CasInteractionsConstants.prefix, CasInteractionsConstants.abortPath), uid));
  }

  componentDidMount() {
    const queryParams: any = PathUtils.queryParamToObject(this.props.location.search);
    const client:string = queryParams.client ? queryParams.client : 'UNKNOWN';
    const scopes:string = queryParams.scopes ? queryParams.scopes : '';
    axios.get(CasApiConstants.prefix + '/' + CasApiConstants.whoamiPath).then((res: AxiosResponse) => {
      console.log(res);
      const whoamiResponse:CasApiWhoAmiResponse = {authorised: false};
      Object.assign(whoamiResponse, res.data);
      this.setState({authorised: whoamiResponse.authorised, client: client, scopes: scopes});
    })
  }

  render() {
    let consentRendered: JSX.Element = <div className="consent-details">{"Loading scopes..."}</div>;
    if (this.state.scopes) {
      consentRendered = 
      <div className={"consent-details"}>
        <div className={"consent-question-label"}>Accept <b className={"consent-client-label"}>{this.state.client}</b> to access the following scopes?</div>
        <div className={"horizontal-divider"} />
        <div className={"columns"}>
                <div className={"column col-auto"}>
                  {"Scopes:"}
                </div>
                <div className={"column col-auto"}>
                  {this.state.scopes}
                </div>
                <div className={"column col-xs-4"} />
          </div>
      </div>
    }

    return (
      <CasConsentViewStyled authorised={this.state.authorised}>
        <div className="container grid-lg p-centered">
          <div className="columns">
          <div className="column col-3" />
            <div className="column col-7">
              <h4>{"> CertAssert / Consent"}</h4>
              <div className="consent-content">
                <div className="columns">
                    <div className={"column col-2 status-label"}>
                      Status:
                    </div>
                    <div className={"column col-2 authorization-state"}>
                      {this.state.authorised ? 'Authorised' : 'Unauthorised'}
                    </div>
                </div>
                {consentRendered}
                <div className="action-buttons">
                    {this.state.authorised ? 
                      <div className="columns">
                        <div className="column col-2" />
                        <div className="column col-5">
                              <div className="columns">
                                <div className="column">
                                  <button id="ca-consent-btn" className="btn btn-primary"
                                    onClick={this.consent.bind(this)}
                                    >Consent</button>
                                </div>
                                <div className="divider-vert" data-content="OR">a</div>
                                <div className="column">
                                  <button id="ca-abort-btn" className="btn"
                                    onClick={this.abort.bind(this)}                                    
                                  >Abort</button>
                                </div>
                              </div>
                        </div>
                      </div>
                      : 
                      <div className="columns">
                        <div className="column col-2"/>
                        <div className="column col-8">
                          <button id="ca-abort-btn" className="btn btn-primary"
                            onClick={this.abort.bind(this)}                                                                
                          >Abort</button>
                        </div>
                      </div>}
                </div>
              </div>
            </div>
        </div>
          
        </div>
      </CasConsentViewStyled>);

  }

}



export default CasConsentView;