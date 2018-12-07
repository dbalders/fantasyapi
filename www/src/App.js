import React, { Component } from 'react';
import './App.css';
import { BuildPlayers } from './BuildPlayers';

class App extends Component {

    componentDidMount() {
    //     this.callApi()
    //         .then(results => {
    //             //Put the game data into a variable to put in  the state
    //             let playerData = results.data;
    //             //Go over each item and add the 6 voting categories for voting css
    //             playerData.map((playerData, i) => {
    //                 gameData.voted = [false, false, false, false, false, false];
    //             });
    //             this.setState({ playerData: playerData }).bind(this)
    //         })
    //         .catch(err => console.log(err));
    // }

    // callApi = async () => {
    //     const response = await fetch('/api/bets');
    //     const body = await response.json();

    //     if (response.status !== 200) throw Error(body.message);

    //     return body;
    };

    render() {
        return (
            <div className="site-container flex-vertical">
                <div className="navbar flex">
                    <div id="sign-in">
                        <a href="/auth/yahoo">Sign in with Yahoo</a>
                    </div>
                </div>
                <BuildPlayers/>
            </div>
        );
    }
}

export default App;