import React, { Component } from 'react';
import Cookies from 'js-cookie';

export class BuildPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerTargetsTwoWeeks: [],
            playerTargetsSeason: [],
            teamPlayers: []
        }
    }

    componentDidMount() {
        var leagueId = Cookies.get('leagueId');
        var teamId = Cookies.get('teamId');

        if (leagueId) {
        	//Their team data
        	this.callApi('/api/teams/' + leagueId + '/' + teamId)
                .then(results => {
                	var playerData = results;
                    this.setState({ teamPlayers: playerData }).bind(this)
                })
                .catch(err => console.log(err));
        	//Targets from last 2 weeks ranking
            this.callApi('/api/targets/twoweeks/' + leagueId)
                .then(results => {
                	var playerData = results[0].players;
                    this.setState({ playerTargetsTwoWeeks: playerData }).bind(this)
                })
                .catch(err => console.log(err));

            //Targets from season ranking
            this.callApi('/api/targets/season/' + leagueId)
                .then(results => {
                	var playerData = results[0].players;
                    this.setState({ playerTargetsSeason: playerData }).bind(this)
                })
                .catch(err => console.log(err));
        }
    }

    callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    render() {
        return (
            <div className="players-container flex">
            <div className="your-team">
	        		{
	        			this.state.teamPlayers.map((playerData, i) => {
	        				return (
	        					<p key={playerData.player_key}>{playerData.full}</p>
	        				)
	        			})
	        		}
	        	</div>
	        	<div className="pickup-targets">
	        		{
	        			this.state.playerTargetsSeason.map((playerData, i) => {
	        				return (
	        					<p key={playerData._id}>{playerData.fullName} {playerData.rank}</p>
	        				)
	        			})
	        		}
	        	</div>
	        	<div className="pickup-targets">
	        		{
	        			this.state.playerTargetsTwoWeeks.map((playerData, i) => {
	        				return (
	        					<p key={playerData._id}>{playerData.fullName} {playerData.rank}</p>
	        				)
	        			})
	        		}
	        	</div>
	        </div>
        )
    }
}