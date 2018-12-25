import React, { Component } from 'react';
import { BuildPlayers } from './BuildPlayers';
import { HomePage } from './HomePage';
import Cookies from 'js-cookie';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navText: '',
            isLoggedIn: false
        }
    }

    componentDidMount() {
        var teamId = Cookies.get('teamId');
        if (teamId !== undefined) {
            this.setState({ navText: 'Refresh Yahoo Data' });
            this.setState({isLoggedIn: true});
        } else {
            this.setState({ navText: 'Sign in with Yahoo' });
        }
    }

    render() {
        const isLoggedIn = this.state.isLoggedIn;
        var homePage;
        var navBar;

        if (!isLoggedIn) {
            homePage = <HomePage/>;
        } else {
            homePage = <BuildPlayers/>;
            navBar = <div className="navbar flex">
                        <div class="sign-in">
                            <a href="/auth/yahoo">{this.state.navText}</a>
                        </div>
                    </div>
        }

        return (
            <div className="site-container flex-vertical">
                {navBar}
                {homePage}
                
            </div>
        );
    }
};

export default App;