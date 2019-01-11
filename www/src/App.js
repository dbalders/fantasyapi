import React, { Component } from 'react';
import { BuildPlayers } from './BuildPlayers';
import { HomePage } from './HomePage';
import Cookies from 'js-cookie';
import YahooSigninImage from './images/yahoo-signin.png'

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navText: '',
            isLoggedIn: false,
            fantasyPlatform: false,
            has_error: false
        }

        this.refreshYahooData = this.refreshYahooData.bind(this);
    }

    componentDidMount() {
        var teamId = Cookies.get('teamId');
        
        if (teamId !== undefined) {
            this.setState({ navText: 'Refresh Yahoo Data' });
            this.setState({isLoggedIn: true});
        } else {
            this.setState({ navText: 'Sign in with Yahoo' });
        }

        var fantasyPlatform = Cookies.get('fantasyPlatform');
        if (fantasyPlatform === 'yahoo') {
            this.setState({'fantasyPlatform': true})
        }
    }

    callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    refreshYahooData() {
        this.callApi('/api/refresh_yahoo_data/')
            .then(results => {
                console.log(results);
                this.forceUpdate();
            })
            .catch(err => {
                console.log(err);
                window.location.href = '/auth/yahoo';
            });
    }

    render() {
        const isLoggedIn = this.state.isLoggedIn;
        var homePage;
        var navBar;
        var footer;

        if (!isLoggedIn) {
            homePage = <HomePage/>;
        } else {
            homePage = <BuildPlayers/>;
        }

        navBar = <div className="navbar flex">
                    <div className="nav-title">
                        <div>Fantasy Basketball Insights</div>
                    </div>
                    <div className="nav-sign-in">
                        <a className={`nav-sign-in-link ${this.state.isLoggedIn ? 'hide' : ''}`} href="/auth/yahoo">
                            <img src={YahooSigninImage} />
                        </a>
                        <a className={`nav-sign-in-link ${this.state.isLoggedIn ? '' : 'hide'}`} onClick={this.refreshYahooData}>
                            <img src={YahooSigninImage} />
                        </a>
                    </div>
                    <div className={`sign-out ${this.state.isLoggedIn ? '' : 'hide'}`}>
                        <a href="/logout">Logout</a>
                    </div>
                </div>

        return (
            <div className="site-container flex-vertical">
                {navBar}
                {homePage}
                {footer}
            </div>
        );
    }
};

export default App;