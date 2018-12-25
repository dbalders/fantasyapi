import React, { Component } from 'react';

export class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }

    componentDidMount() {}

    render() {
        return(
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
                            <input></input>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}