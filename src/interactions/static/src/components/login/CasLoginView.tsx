import React from "react";
import CasLoginViewStyled from "./CasLoginView.styled";
import { Cert, ClientCert, DistinguishedNameAttribute } from "../../../../../model/CasCert";
import { CasApiWhoAmiResponse } from "../../../../../api/handlers/CasApiWhoAmIHandler";
import { CasInteractionsConstants } from "../../../../../interactions/constants/CasInteractionsConstants";
import { CasApiConstants } from "../../../../../api/constants/CasApiConstants";
import { PathUtils} from "../../../../../utils/PathUtils";

import axios, {AxiosResponse} from "axios";
import "spectre.css";

export type CasLoginViewProps = {
}

interface CasLoginViewState {
  authorised: boolean,
  cert?: ClientCert
}

type ReactComponentProps = {
  location: {
    pathname: string
  }
}

export class CasLoginView extends React.Component<CasLoginViewProps, CasLoginViewState> {

  constructor(props: CasLoginViewProps) {
    super(props);
    this.state = {
      authorised: false
    }
  }

  signIn(): void {
    const uid = PathUtils.getUidFromPath((this.props as ReactComponentProps).location.pathname);
    PathUtils.redirectAgent(PathUtils.buildInteractionPath(PathUtils.buildPath(false, CasInteractionsConstants.prefix, CasInteractionsConstants.loginPath), uid));
  }

  abort(): void {
    const uid = PathUtils.getUidFromPath((this.props as ReactComponentProps).location.pathname);
    PathUtils.redirectAgent(PathUtils.buildInteractionPath(PathUtils.buildPath(false, CasInteractionsConstants.prefix, CasInteractionsConstants.abortPath), uid));
  }

  componentDidMount() {
    axios.get(CasApiConstants.prefix + '/' + CasApiConstants.whoamiPath).then((res: AxiosResponse) => {
      console.log(res);
      const whoamiResponse:CasApiWhoAmiResponse = {authorised: false};
      Object.assign(whoamiResponse, res.data);
      this.setState({cert: whoamiResponse.cert, authorised: whoamiResponse.authorised});
    })
  }

  render() {
    if (this.state.cert) {
      // Iterate over DN attributes for subject
      let certificatesRendered: Array<JSX.Element> = [];

      // Iterate the chain
      let certChain: Cert | undefined = this.state.cert;
      let index = 0;
      while(certChain) {
          const currentCert: Cert = certChain as Cert;
          const certDetails: Array<JSX.Element> = [];
          certDetails.push(<div className={"certificate-type-label"}>{
            index === 0 ?
            "Client Certificate" : (currentCert.issuerCertRef ? 'Intermediate CA' : 'Root CA')
            }</div>);
          certDetails.push(<div className={"horizontal-divider"} />);
          Object.entries(DistinguishedNameAttribute).forEach((value: [string, DistinguishedNameAttribute]) => {
            if (currentCert.subject[value[1]]) {
              certDetails.push(
              <div className={"columns"}>
                <div className={"column col-xs-4"}>
                  {value[0]}
                </div>
                <div className={"column col-xs-8"}>
                  {currentCert.subject[value[1]]}
                </div>
              </div>)
            }
          })
        certificatesRendered.push(<div key={index} className={"cert-details"}>{certDetails}</div>);
        certChain = certChain.issuerCertRef;
        index++;
      }

      return (
        <CasLoginViewStyled authorised={this.state.authorised}>
          <div className="container grid-lg p-centered">
            <div className="columns">
            <div className="column col-3" />
              <div className="column col-6">
                <h4>{"> CertAssert / Sign-In"}</h4>
                <div className="signin-content">
                  <div className="columns">
                      <div className={"column col-2 status-label"}>
                        Status:
                      </div>
                      <div className={"column col-2 authorization-state"}>
                        {this.state.authorised ? 'Authorised' : 'Unauthorised'}
                      </div>
                  </div>
                  {certificatesRendered}
                  <div className="action-buttons">
                      {this.state.authorised ? 
                        <div className="columns">
                          <div className="column col-2" />
                          <div className="column col-5">
                                <div className="columns">
                                  <div className="column">
                                    <button id="ca-signin-btn" className="btn btn-primary" autoFocus={true}
                                      onClick={this.signIn.bind(this)}
                                      >Sign In</button>
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
                            <button id="ca-abort-btn" className="btn btn-primary" autoFocus={true}
                              onClick={this.abort.bind(this)}                                                                
                            >Abort</button>
                          </div>
                        </div>}
                  </div>
                </div>
              </div>
          </div>
            
          </div>
        </CasLoginViewStyled>
      ); 

    } else {
      return (<div>
        <CasLoginViewStyled authorised={false}>bb</CasLoginViewStyled>
      </div>);
    }

  }

}

export default CasLoginView;