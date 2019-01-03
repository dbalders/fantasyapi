import React, { Component } from 'react';
import { BuildPlayers } from './BuildPlayers';
import Cookies from 'js-cookie';
// import { LeagueInput } from './LeagueInput';

export class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {}

    render() {
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
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}