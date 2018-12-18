import React, { Component } from 'react';
import Cookies from 'js-cookie';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import stringSimilarity from 'string-similarity';

export class BuildPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerTargetsTwoWeeks: [],
            playerTargetsSeason: [],
            teamPlayers: [],
            playerRankingsSeason: [],
            playerRankingsTwoWeeks: [],
            teamStatsSeason: [],
            teamStatsTwoWeeks: []
        }
    }

    componentDidMount() {
        var leagueId = Cookies.get('leagueId');
        var teamId = Cookies.get('teamId');

        if (leagueId) {
            //Targets from last 2 weeks ranking
            this.callApi('/api/targets/twoweeks/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsTwoWeeks: playerData }).bind(this);
                })
                .catch(err => console.log(err));

            //Targets from season ranking
            this.callApi('/api/targets/season/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsSeason: playerData }).bind(this);
                })
                .catch(err => console.log(err));

            this.callApi('/api/rankings/season/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsSeason: playerData }).bind(this);
                })
                .catch(err => console.log(err));

            this.callApi('/api/rankings/twoweeks/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsTwoWeeks: playerData }).bind(this);
                })
                .catch(err => console.log(err));

            if (teamId) {
                //Their team data
                this.callApi('/api/teams/' + leagueId + '/' + teamId)
                    .then(results => {
                        var playerData = results;
                        //check if the data is there, and if not, add a .5 sec wait then send to the build function
                        if (this.state.playerRankingsSeason.length === 0 || this.state.playerRankingsTwoWeeks.length === 0) {
                            setTimeout(function() {
                                this.setState({ teamPlayers: playerData }, this.buildTeam);
                            }.bind(this), 500)
                        } else {
                            this.setState({ teamPlayers: playerData }, this.buildTeam).bind(this);
                        }
                    })
                    .catch(err => console.log(err));
            }
        }
    }

    callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    buildTeam() {
        var teamStatsSeason = [];
        var teamStatsTwoWeeks = [];
        var teamPlayers = this.state.teamPlayers;
        var playerRankingsSeason = this.state.playerRankingsSeason;
        var playerRankingsTwoWeeks = this.state.playerRankingsTwoWeeks;
        console.log(playerRankingsTwoWeeks)

        //for each player if string similarity > .7 in player rankings, then return
        for (var i = 0; i < teamPlayers.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarPlayerSeason = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsSeason[j].fullName);
                if (similarPlayerSeason > 0.7) {
                    teamStatsSeason.push(playerRankingsSeason[j]);
                    break
                }
            }

            for (var k = 0; k < playerRankingsTwoWeeks.length; k++) {
                var similarPlayerTwoWeeks = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsTwoWeeks[k].fullName);
                if (similarPlayerTwoWeeks > 0.7) {
                    teamStatsTwoWeeks.push(playerRankingsTwoWeeks[k]);
                    break
                }
            }
        }

        console.log(teamStatsSeason);
        this.setState({ teamStatsSeason: teamStatsSeason });
        this.setState({ teamStatsTwoWeeks: teamStatsTwoWeeks });
        console.log(teamStatsTwoWeeks);
    }

    render() {
        const columnNames = [{
            Header: 'Rank',
            accessor: 'rank' // String-based value accessors!
        }, {
            Header: 'Value',
            accessor: 'value' // String-based value accessors!
        }, {
            Header: 'Name',
            accessor: 'fullName' // String-based value accessors!
        }, {
            Header: 'Points',
            accessor: 'pV' // String-based value accessors!
        }, {
            Header: '3s',
            accessor: '3V' // String-based value accessors!
        }, {
            Header: 'Rebounds',
            accessor: 'rV' // String-based value accessors!
        }, {
            Header: 'Assists',
            accessor: 'aV' // String-based value accessors!
        }, {
            Header: 'Steals',
            accessor: 'sV' // String-based value accessors!
        }, {
            Header: 'Blocks',
            accessor: 'bV' // String-based value accessors!
        }, {
            Header: 'FG%',
            accessor: 'fg%V' // String-based value accessors!
        }, {
            Header: 'FT%',
            accessor: 'ft%V' // String-based value accessors!
        }, {
            Header: 'Turnovers',
            accessor: 'toV' // String-based value accessors!
        }];

        return (
            <div>
                <div className="table">
                  <ReactTable
                    data={this.state.teamStatsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    // defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'rank',
                        desc: false
                    }]}
                  />
                </div>
                <div className="table">
                  <ReactTable
                    data={this.state.teamStatsTwoWeeks}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    // defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'rank',
                        desc: false
                    }]}
                  />
                </div>
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
            </div>
        )
    }
}