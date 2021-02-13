import React from "react";
import CasLoginViewStyled from "./CasLoginView.styled";

interface CasLoginViewState {
}
  
export type CasLoginViewProps = {
    title: string;
}

export class CasLoginView extends React.Component<CasLoginViewProps, CasLoginViewState> {
  
  constructor(props:CasLoginViewProps) {
    super(props);
  }

  render() {
    return (
      <CasLoginViewStyled>
        <h1>{this.props.title}</h1>
      </CasLoginViewStyled>
    );
  }
}