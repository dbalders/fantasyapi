import React, { Component } from 'react';
import './App.css';
import { BuildPlayers } from './BuildPlayers';
import Cookies from 'js-cookie';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navText: ''
        }
    }

    componentDidMount() {
        var teamId = Cookies.get('teamId');
        if (teamId !== undefined) {
            this.setState({ navText: 'Refresh Yahoo Data' });
        } else {
            this.setState({ navText: 'Sign in with Yahoo' });
        }
    }

    render() {
        return (
            <div className="site-container flex-vertical">
                <div className="navbar flex">
                    <div id="sign-in">
                        <a href="/auth/yahoo">{this.state.navText}</a>
                    </div>
                </div>
                <BuildPlayers/>
            </div>
        );
    }
};

export default App;