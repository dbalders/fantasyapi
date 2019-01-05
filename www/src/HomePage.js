import React, { Component } from 'react';
import Cookies from 'js-cookie';
import Select from 'react-select';
import { EspnInput } from './EspnInput';

export class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            espnTeamSelected: [],
            espnTeamSelect: [],
            showEspnInput: false,
            espnId: 0,
            espnIdError: null
        }
        this.showEspnTeamInput = this.showEspnTeamInput.bind(this);
        this.espnIdError = this.espnIdError.bind(this);
    }

    componentDidMount() { }

    showEspnTeamInput = (teamsArray, espnId) => {

        const teamSelect = [];
        for (var i = 0; i < teamsArray.length; i++) {
            teamSelect.push({ value: teamsArray[i].team_id, label: teamsArray[i].name })
        }

        this.setState({
            showEspnInput: true,
            espnTeamSelect: teamSelect,
            espnId: espnId
        })
    }

    espnIdError = (error) => {
        this.setState({espnIdError: error});

        if (error === 'Not Found') {
            this.setState({espnIdError: 'ESPN league is not found'});
        }

        if (error === 'You are not authorized to view this League.') {
            this.setState({espnIdError: 'You are not authorized to view this ESPN League.'});
        }
    }

    handleEspnTeamChange = (espnTeamSelected) => {
        Cookies.set('leagueId', this.state.espnId);
        Cookies.set('teamId', espnTeamSelected.value);
        window.location.reload();
    }

    render() {
        const { espnTeamSelected } = this.state;
        const { espnTeamSelect } = this.state;

        return (
            <div className="landing-container flex-vertical flex-one">
                <div className="landing-site-title flex-one flex">Fantasy Basketball Insights</div>
                <div className="landing-actions-container">
                    <div className="landing-actions flex-vertical">
                        <div className="landing-text">Sign in with Yahoo</div>
                        <div className="landing-buttons flex">
                            <div className="sign-in">
                                <a href="/auth/yahoo">Sign in with Yahoo</a>
                            </div>
                            <EspnInput showEspnTeamInput={this.showEspnTeamInput} espnIdError={this.espnIdError} />
                        </div>
                        <div className={`team-select ${this.state.showEspnInput ? '' : 'hide'}`}>
                            <Select
                                value={espnTeamSelected}
                                onChange={this.handleEspnTeamChange}
                                options={espnTeamSelect}
                            />
                        </div>
                        <div className={`espn-error ${this.state.espnIdError ? '' : 'hide'}`}>
                            <div>{this.state.espnIdError}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}