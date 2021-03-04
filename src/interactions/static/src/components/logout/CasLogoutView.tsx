import React from "react";
import CasLogoutViewStyled from "./CasLogoutView.styled";
import { PathUtils} from "../../../../../utils/PathUtils";
import "spectre.css";

export type CasLogoutViewProps = {
  match: {
    params: {
      uid: string
    }
  },
  location: {
    search: string
  }
}

interface CasLogoutViewState {
  confirmedSignout: boolean;
}

export class CasLogoutView extends React.Component<CasLogoutViewProps, CasLogoutViewState> {

  constructor(props: CasLogoutViewProps) {
    super(props);
    this.state = {
      confirmedSignout: false
    }
  }

  logout(): void {

  }

  cancel(): void {
    // TODO: go back
    window.history.back();
  }

  componentWillMount() {
    const queryParams: any = PathUtils.queryParamToObject(this.props.location.search);
    const confirmedSignOut:boolean = !!(queryParams.confirmedSignOut ? queryParams.confirmedSignOut : false);
    this.setState({confirmedSignout: confirmedSignOut});
  }

  componentDidMount() {
    if (this.state.confirmedSignout) {
      const form: HTMLElement | null = document.getElementById("logoutForm");
      if (form) {
        (form as HTMLFormElement).submit();
      }
    }
  }

  render() {

    if (this.state.confirmedSignout) {
      // No need to render dialogue
      return <div>
        <form id="logoutForm" method="post" action="/oidc/session/end/confirm">
          <input type="hidden" name="xsrf" value={this.props.match.params.uid}/>
        </form>
      </div>;
    }

    return (
      <CasLogoutViewStyled>
        <div className="container grid-lg p-centered">
          <div className="columns">
          <div className="column col-3" />
            <div className="column col-7">
              <h4>{"> CertAssert / Sign Out"}</h4>
              <div className="consent-content">
                <form id="logoutForm" method="post" action="/oidc/session/end/confirm">
                  <input type="hidden" name="xsrf" value={this.props.match.params.uid}/>
                </form>
                <div className="action-buttons">
                      <div className="columns">
                        <div className="column col-1" />
                        <div className="column col-5">
                              <div className="columns">
                                <div className="column">
                                  <button id="ca-consent-btn" className="btn btn-primary" autoFocus={true} type="submit" form="logoutForm" value="yes" name="logout"
                                    >Sign Out</button>
                                </div>
                                <div className="divider-vert" data-content="OR">a</div>
                                <div className="column">
                                  <button id="ca-abort-btn" className="btn"
                                    onClick={this.cancel.bind(this)}
                                    >Cancel</button>
                                </div>
                              </div>
                        </div>
                      </div>
                </div>
              </div>
            </div>
        </div>
          
        </div>
      </CasLogoutViewStyled>);

  }

}



export default CasLogoutView;