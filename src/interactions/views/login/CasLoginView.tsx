import React from "react";
import CasLoginViewStyled from "./CasLoginView.styled";
import { RequestCasExtensions } from "../../../dataAdaptation/networking/types/CasNetworkingTypes";
import { CasCert } from "../../../model/CasCert";

interface CasLoginViewState {
}
  
export type CasLoginViewProps = {
    title: string,
    authorised: boolean,
    casExtensions: RequestCasExtensions,
    signinPath: string,
    abortPath: string
}

export class CasLoginView extends React.Component<CasLoginViewProps, CasLoginViewState> {
  
  constructor(props:CasLoginViewProps) {
    super(props);
  }

  render() {

    // Iterate over DN attributes for subject
    let certificatesRendered: Array<JSX.Element> = [];

    // Iterate the chain
    let currentCert: CasCert.Cert = this.props.casExtensions.clientCertificate;
    let index = 0;
    while(currentCert) {
        const certDetails: Array<JSX.Element> = [];
        certDetails.push(<div className={"certificate-type-label"}>{
          index === 0 ?
          "Client Certificate" : (currentCert.issuerCertRef ? 'Intermediate CA' : 'Root CA')
          }</div>);
        certDetails.push(<div className={"horizontal-divider"} />);
        Object.entries(CasCert.DistinguishedNameAttribute).forEach((value: [string, CasCert.DistinguishedNameAttribute]) => {
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
      currentCert = currentCert.issuerCertRef;
      index++;
    }
    return (
      <CasLoginViewStyled authorised={this.props.authorised}>
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
                      {this.props.authorised ? 'Authorised' : 'Unauthorised'}
                    </div>
                </div>
                {certificatesRendered}
                <div className="action-buttons">
                    {this.props.authorised ? 
                      <div className="columns">
                        <div className="column col-2" />
                        <div className="column col-5">
                              <div className="columns">
                                <div className="column">
                                  <button id="ca-signin-btn" className="btn btn-primary">Sign In</button>
                                </div>
                                <div className="divider-vert" data-content="OR">a</div>
                                <div className="column">
                                  <button id="ca-abort-btn" className="btn">Abort</button>
                                </div>
                              </div>
                        </div>
                      </div>
                      : 
                      <div className="columns">
                        <div className="column col-2"/>
                        <div className="column col-8">
                          <button id="ca-abort-btn" className="btn btn-primary">Abort</button>
                        </div>
                      </div>}
                </div>
              </div>
            </div>
        </div>
          
        </div>
      </CasLoginViewStyled>
    );  
  }
}