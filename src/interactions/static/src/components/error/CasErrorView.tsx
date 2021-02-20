import React from "react";
import CasErrorViewStyled from "./CasErrorView.styled";
import { PathUtils} from "../../../../../utils/PathUtils";
import "spectre.css";

export type CasErrorViewProps = {
  location: {
    search: string
  }
}

interface CasErrorViewState {
  reason: string,
  details: string
}

export class CasErrorView extends React.Component<CasErrorViewProps, CasErrorViewState> {

  constructor(props: CasErrorViewProps) {
    super(props);
    this.state = {
      reason:"UNKNOWN",
      details: ""
    }
  }

  componentWillMount() {
    const queryParams: any = PathUtils.queryParamToObject(this.props.location.search);
    const reason:string = queryParams.reason ? queryParams.reason : 'invalid_request';
    const details:string = queryParams.details ? queryParams.details : 'unrecognized route';
    this.setState({reason: reason, details: details});
  }

  render() {

    return (
      <CasErrorViewStyled>
        <div className="container grid-lg p-centered">
          <div className="columns">
          <div className="column col-3" />
            <div className="column col-7">
              <h4>{"> CertAssert / Error"}</h4>
              <div className="error-content">
                <div className={"error-details"}>
                  <div className={"error-label"}>Something is kaput</div>
                  <div className={"horizontal-divider"} />
                  <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"Reason:"}
                          </div>
                          <div className={"column col-auto"}>
                            {this.state.reason}
                          </div>
                          <div className={"column col-xs-4"} />
                    </div>
                    <div className={"columns"}>
                          <div className={"column col-auto"}>
                            {"Details:"}
                          </div>
                          <div className={"column col-auto error-description"}>
                            {this.state.details}
                          </div>
                          <div className={"column col-xs-4"} />
                    </div>
                </div>
              </div>
            </div>
        </div>
        </div>
      </CasErrorViewStyled>);
  }
}



export default CasErrorView;