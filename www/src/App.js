import React, { Component } from 'react';
import { BuildPlayers } from './BuildPlayers';
import { HomePage } from './HomePage';
import { TradeAnalysis } from './TradeAnalysys';
import Cookies from 'js-cookie';
import YahooSigninImage from './images/yahoo-signin.png'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import { callApi } from './CallApi';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navText: '',
            isLoggedIn: false,
            fantasyPlatform: false,
            has_error: false,
            key: 1
        }

        this.refreshYahooData = this.refreshYahooData.bind(this);
    }

    componentDidMount() {
        var teamId = Cookies.get('teamId');

        if (teamId !== undefined) {
            this.setState({ navText: 'Refresh Yahoo Data' });
            this.setState({ isLoggedIn: true });
        } else {
            this.setState({ navText: 'Sign in with Yahoo' });
        }

        var fantasyPlatform = Cookies.get('fantasyPlatform');
        if (fantasyPlatform === 'yahoo') {
            this.setState({ 'fantasyPlatform': true })
        }
    }

    refreshYahooData() {
        callApi('/api/refresh_yahoo_data/')
            .then(results => {
                //Change the key to re-render the components
                localStorage.removeItem('teamPlayers');
                this.setState({ key: this.state.key + 1 })
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
            homePage = <HomePage key={this.state.key} />;
        } else {
            homePage = <BuildPlayers key={this.state.key} />;
        }

        navBar = <div className="navbar flex">
            <div className="nav-title">
                <Link to="/">FantasyBasketball.io</Link>
            </div>
            <div className="nav-sign-in flex">
                <a className={`nav-sign-in-link ${this.state.isLoggedIn ? 'hide' : ''}`} href="/auth/yahoo">
                    <img alt="yahoo-login" src={YahooSigninImage} />
                </a>

                <div className={`nav-refresh ${this.state.isLoggedIn ? '' : 'hide'}`}>
                    <Link to="/trade">Trade Analysis</Link>
                </div>

                <div className={`nav-refresh ${this.state.isLoggedIn ? '' : 'hide'}`} onClick={this.refreshYahooData}>
                    <a>Refresh Yahoo Data</a>
                </div>
            </div>
            <div className={`sign-out ${this.state.isLoggedIn ? '' : 'hide'}`}>
                <a href="/logout">Logout</a>
            </div>
        </div>

        return (
            <Router>
                <div className="site-container flex-vertical">
                    {navBar}
                    <Route path="/" exact render={() => homePage} />
                    <Route path="/trade/" component={TradeAnalysis} />
                    {footer}
                </div>
            </Router>
        );
    }
};

export default App;