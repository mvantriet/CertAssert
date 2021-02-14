import React from "react";
import CasLoginViewStyled from "./CasLoginView.styled";
import { RequestCasExtensions } from "../../../dataAdaptation/networking/types/CasNetworkingTypes";

interface CasLoginViewState {
}
  
export type CasLoginViewProps = {
    title: string,
    authorised: boolean,
    casExtensions: RequestCasExtensions
}

export class CasLoginView extends React.Component<CasLoginViewProps, CasLoginViewState> {
  
  constructor(props:CasLoginViewProps) {
    super(props);
  }

  render() {
    return (
      <CasLoginViewStyled authorised={this.props.authorised}>
        <h1>{this.props.authorised ? 'Authorised' : 'Unauthorised'}</h1>
      </CasLoginViewStyled>
    );  
}
}