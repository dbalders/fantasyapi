import React, { Component } from 'react';
import { BuildPlayers } from './BuildPlayers';
// import { LeagueInput } from './LeagueInput';

export class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leagueId: ""
        }

        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {}

    _handleKeyPress = (e) => {
        
        if (e.key === 'Enter') {
            console.log(this.state.leagueId)
            this.callApi('/api/teams/' + this.state.leagueId)
                .then(results => {
                    console.log(results)
                    // this.setState({ showCompareTable: true });
                    // this.buildTeam(results)
                })
                .catch(err => console.log(err));
        }
    }

    handleChange(e) {
      this.setState({ leagueId: e.target.value });
   }

   callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div className="landing-container flex-vertical flex-one">
                <div className="landing-site-title flex-one flex">Fantasy Basketball Insights</div>
                <div className="landing-actions-container">
                    <div className="landing-actions flex-vertical">
                        <div className="landing-text">Sign in with Yahoo or enter the league's ID</div>
                        <div className="landing-text-small">(League must be public)</div>
                        <div className="landing-buttons flex">
                            <div className="sign-in">
                                <a href="/auth/yahoo">Sign in with Yahoo</a>
                            </div>
                            <input className="league-id-input" type="number" value={this.state.leagueId} placeholder="40083" 
                            onChange={this.handleChange} onKeyPress={this._handleKeyPress} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}