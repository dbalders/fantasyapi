import React, { Component } from 'react';
import Cookies from 'js-cookie';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import stringSimilarity from 'string-similarity';
import { CompareTeams } from './CompareTeams';

export class BuildPlayers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            playerTargetsRecent: [],
            playerTargetsSeason: [],
            teamPlayers: [],
            playerRankingsSeason: [],
            playerRankingsRecent: [],
            teamStatsSeason: [],
            teamStatsRecent: [],
            teamStatsSeasonAvg: [],
            teamStatsRecentAvg: [],
            playerPickupsSeason: [],
            playerPickupsRecent: [],
            teams: [],
            teamSelected: null,
            leagueId: null
        }
    }

    componentDidMount() {
        var leagueId = Cookies.get('leagueId');
        var teamId = Cookies.get('teamId');

        if (leagueId) {
            this.setState({ leagueId: leagueId });

            //Targets from last 2 weeks ranking
            this.callApi('/api/targets/recent/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsRecent: playerData });
                })
                .catch(err => console.log(err));

            //Targets from season ranking
            this.callApi('/api/targets/season/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsSeason: playerData });
                })
                .catch(err => console.log(err));

            this.callApi('/api/player_data/season/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsSeason: playerData });
                })
                .catch(err => console.log(err));

            this.callApi('/api/player_data/recent/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsRecent: playerData });
                })
                .catch(err => console.log(err));

            this.callApi('/api/teams/' + leagueId)
                .then(results => {
                    var teams = results[0].teams;
                    this.setState({ teams: teams });
                })
                .catch(err => console.log(err));

            if (teamId) {
                //Their team data
                this.callApi('/api/teams/' + leagueId + '/' + teamId)
                    .then(results => {
                        var playerData = results;
                        //check if the data is there, and if not, add a .5 sec wait then send to the build function
                        if (this.state.playerRankingsSeason.length === 0 || this.state.playerRankingsRecent.length === 0) {
                            setTimeout(function() {
                                this.setState({ teamPlayers: playerData }, this.buildTeam);
                            }.bind(this), 1000)
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
        var teamStatsRecent = [];
        var teamStatsSeasonAvg = [];
        var teamStatsRecentAvg = [];
        var teamPickupsSeason = [];
        var teamPickupsRecent = [];
        var teamPlayers = this.state.teamPlayers;
        var playerRankingsSeason = this.state.playerRankingsSeason;
        var playerRankingsRecent = this.state.playerRankingsRecent;
        var playerPickupsSeason = this.state.playerTargetsSeason;
        var playerPickupsRecent = this.state.playerTargetsRecent;

        //for each player if string similarity > .7 in player rankings, then return
        for (var i = 0; i < teamPlayers.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarPlayerSeason = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsSeason[j].playerName);
                if (similarPlayerSeason > 0.7) {
                    teamStatsSeason.push(playerRankingsSeason[j]);
                    teamStatsSeasonAvg = {
                        ptsRating: (teamStatsSeasonAvg.ptsRating) ? (teamStatsSeasonAvg.ptsRating + playerRankingsSeason[j].ptsRating) : playerRankingsSeason[j].ptsRating,
                        threeRating: (teamStatsSeasonAvg.threeRating) ? (teamStatsSeasonAvg.threeRating + playerRankingsSeason[j].threeRating) : playerRankingsSeason[j].threeRating,
                        astRating: (teamStatsSeasonAvg.astRating) ? (teamStatsSeasonAvg.astRating + playerRankingsSeason[j].astRating) : playerRankingsSeason[j].astRating,
                        rebRating: (teamStatsSeasonAvg.rebRating) ? (teamStatsSeasonAvg.rebRating + playerRankingsSeason[j].rebRating) : playerRankingsSeason[j].rebRating,
                        stlRating: (teamStatsSeasonAvg.stlRating) ? (teamStatsSeasonAvg.stlRating + playerRankingsSeason[j].stlRating) : playerRankingsSeason[j].stlRating,
                        blkRating: (teamStatsSeasonAvg.blkRating) ? (teamStatsSeasonAvg.blkRating + playerRankingsSeason[j].blkRating) : playerRankingsSeason[j].blkRating,
                        fgMixedRating: (teamStatsSeasonAvg.fgMixedRating) ? (teamStatsSeasonAvg.fgMixedRating + playerRankingsSeason[j].fgMixedRating) : playerRankingsSeason[j].fgMixedRating,
                        ftMixedRating: (teamStatsSeasonAvg.ftMixedRating) ? (teamStatsSeasonAvg.ftMixedRating + playerRankingsSeason[j].ftMixedRating) : playerRankingsSeason[j].ftMixedRating,
                        toRating: (teamStatsSeasonAvg.toRating) ? (teamStatsSeasonAvg.toRating + playerRankingsSeason[j].toRating) : playerRankingsSeason[j].toRating
                    }
                    break
                }
            }

            for (var j = 0; j < playerRankingsRecent.length; j++) {
                var similarPlayerRecent = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsRecent[j].playerName);
                if (similarPlayerRecent > 0.7) {
                    teamStatsRecent.push(playerRankingsRecent[j]);
                    teamStatsRecentAvg = {
                        ptsRating: (teamStatsRecentAvg.ptsRating) ? (teamStatsRecentAvg.ptsRating + playerRankingsRecent[j].ptsRating) : playerRankingsRecent[j].ptsRating,
                        threeRating: (teamStatsRecentAvg.threeRating) ? (teamStatsRecentAvg.threeRating + playerRankingsRecent[j].threeRating) : playerRankingsRecent[j].threeRating,
                        astRating: (teamStatsRecentAvg.astRating) ? (teamStatsRecentAvg.astRating + playerRankingsRecent[j].astRating) : playerRankingsRecent[j].astRating,
                        rebRating: (teamStatsRecentAvg.rebRating) ? (teamStatsRecentAvg.rebRating + playerRankingsRecent[j].rebRating) : playerRankingsRecent[j].rebRating,
                        stlRating: (teamStatsRecentAvg.stlRating) ? (teamStatsRecentAvg.stlRating + playerRankingsRecent[j].stlRating) : playerRankingsRecent[j].stlRating,
                        blkRating: (teamStatsRecentAvg.blkRating) ? (teamStatsRecentAvg.blkRating + playerRankingsRecent[j].blkRating) : playerRankingsRecent[j].blkRating,
                        fgMixedRating: (teamStatsRecentAvg.fgMixedRating) ? (teamStatsRecentAvg.fgMixedRating + playerRankingsRecent[j].fgMixedRating) : playerRankingsRecent[j].fgMixedRating,
                        ftRaftMixedRatingting: (teamStatsRecentAvg.ftMixedRating) ? (teamStatsRecentAvg.ftMixedRating + playerRankingsRecent[j].ftMixedRating) : playerRankingsRecent[j].ftMixedRating,
                        toRating: (teamStatsRecentAvg.toRating) ? (teamStatsRecentAvg.toRating + playerRankingsRecent[j].toRating) : playerRankingsRecent[j].toRating
                    }
                    break
                }
            }
        }

        for (var i = 0; i < playerPickupsSeason.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarTargetsSeason = stringSimilarity.compareTwoStrings(playerPickupsSeason[i].playerName, playerRankingsSeason[j].playerName);
                if (similarTargetsSeason > 0.7) {
                    teamPickupsSeason.push(playerRankingsSeason[j]);
                    break
                }
            }
        }

        for (var i = 0; i < playerPickupsRecent.length; i++) {
            for (var j = 0; j < playerRankingsRecent.length; j++) {
                var similarTargetsRecent = stringSimilarity.compareTwoStrings(playerPickupsRecent[i].playerName, playerRankingsRecent[j].playerName);
                if (similarTargetsRecent > 0.7) {
                    teamPickupsRecent.push(playerRankingsRecent[j]);
                    break
                }
            }
        }

        this.setState({ teamStatsSeason: teamStatsSeason });
        this.setState({ teamStatsRecent: teamStatsRecent });
        this.setState({ playerPickupsSeason: playerPickupsSeason });
        this.setState({ playerPickupsRecent: playerPickupsRecent });

        teamStatsSeasonAvg = {
            ptsRating: Number(teamStatsSeasonAvg.ptsRating / teamStatsSeason.length).toFixed(2),
            threeRating: Number(teamStatsSeasonAvg.threeRating / teamStatsSeason.length).toFixed(2),
            astRating: Number(teamStatsSeasonAvg.astRating / teamStatsSeason.length).toFixed(2),
            rebRating: Number(teamStatsSeasonAvg.rebRating / teamStatsSeason.length).toFixed(2),
            stlRating: Number(teamStatsSeasonAvg.stlRating / teamStatsSeason.length).toFixed(2),
            blkRating: Number(teamStatsSeasonAvg.blkRating / teamStatsSeason.length).toFixed(2),
            fgMixedRating: Number(teamStatsSeasonAvg.fgMixedRating / teamStatsSeason.length).toFixed(2),
            ftMixedRating: Number(teamStatsSeasonAvg.ftMixedRating / teamStatsSeason.length).toFixed(2),
            toRating: Number(teamStatsSeasonAvg.ftRating / teamStatsSeason.length).toFixed(2)
        }


        teamStatsRecentAvg = {
            ptsRating: Number(teamStatsRecentAvg.ptsRating / teamStatsRecent.length).toFixed(2),
            threeRating: Number(teamStatsRecentAvg.threeRating / teamStatsRecent.length).toFixed(2),
            astRating: Number(teamStatsRecentAvg.astRating / teamStatsRecent.length).toFixed(2),
            rebRating: Number(teamStatsRecentAvg.rebRating / teamStatsRecent.length).toFixed(2),
            stlRating: Number(teamStatsRecentAvg.stlRating / teamStatsRecent.length).toFixed(2),
            blkRating: Number(teamStatsRecentAvg.blkRating / teamStatsRecent.length).toFixed(2),
            fgMixedRating: Number(teamStatsRecentAvg.fgMixedRating / teamStatsRecent.length).toFixed(2),
            ftMixedRating: Number(teamStatsRecentAvg.ftMixedRating / teamStatsRecent.length).toFixed(2),
            toRating: Number(teamStatsRecentAvg.ftRating / teamStatsRecent.length).toFixed(2)
        }

        //Put the [] around the arrays so the table below can know its a single row
        this.setState({ teamStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ teamStatsRecentAvg: [teamStatsRecentAvg] });
    }

    render() {
        const { teamSelected } = this.state;
        const brightGreen = '#3ffc3f';
        const mediumGreen = '#85fc85';
        const lightGreen = '#b9ffb9';
        const lightRed = '#ffdfdf';
        const mediumRed = '#ffb8b8';
        const brightRed = '#ff8282';
        const columnNames = [{
            Header: 'Rank',
            accessor: 'overallRank'
        }, {
            Header: 'Value',
            accessor: 'overallRating'
        }, {
            Header: 'Name',
            accessor: 'playerName',
            width: 200
        }, {
            Header: 'Points',
            accessor: 'ptsRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.ptsRating > 2 ? brightGreen :
                        rowInfo.row.ptsRating > 1 ? mediumGreen : 
                        rowInfo.row.ptsRating >= .5 ? lightGreen : 
                        rowInfo.row.ptsRating < 0 && rowInfo.row.ptsRating > -1 ? lightRed :
                        rowInfo.row.ptsRating <= -1 && rowInfo.row.ptsRating > -2 ? mediumRed : 
                        rowInfo.row.ptsRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: '3s',
            accessor: 'threeRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.threeRating > 2 ? brightGreen :
                        rowInfo.row.threeRating > 1 ? mediumGreen : 
                        rowInfo.row.threeRating >= .5 ? lightGreen : 
                        rowInfo.row.threeRating < 0 && rowInfo.row.threeRating > -1 ? lightRed :
                        rowInfo.row.threeRating <= -1 && rowInfo.row.threeRating > -2 ? mediumRed : 
                        rowInfo.row.threeRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: 'rebRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.rebRating > 2 ? brightGreen :
                        rowInfo.row.rebRating > 1 ? mediumGreen : 
                        rowInfo.row.rebRating >= .5 ? lightGreen : 
                        rowInfo.row.rebRating < 0 && rowInfo.row.rebRating > -1 ? lightRed :
                        rowInfo.row.rebRating <= -1 && rowInfo.row.rebRating > -2 ? mediumRed : 
                        rowInfo.row.rebRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: 'astRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.astRating > 2 ? brightGreen :
                        rowInfo.row.astRating > 1 ? mediumGreen : 
                        rowInfo.row.astRating >= .5 ? lightGreen : 
                        rowInfo.row.astRating < 0 && rowInfo.row.astRating > -1 ? lightRed :
                        rowInfo.row.astRating <= -1 && rowInfo.row.astRating > -2 ? mediumRed : 
                        rowInfo.row.astRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: 'stlRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.stlRating > 2 ? brightGreen :
                        rowInfo.row.stlRating > 1 ? mediumGreen : 
                        rowInfo.row.stlRating >= .5 ? lightGreen : 
                        rowInfo.row.stlRating < 0 && rowInfo.row.stlRating > -1 ? lightRed :
                        rowInfo.row.stlRating <= -1 && rowInfo.row.stlRating > -2 ? mediumRed : 
                        rowInfo.row.stlRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: 'blkRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.blkRating > 2 ? brightGreen :
                        rowInfo.row.blkRating > 1 ? mediumGreen : 
                        rowInfo.row.blkRating >= .5 ? lightGreen : 
                        rowInfo.row.blkRating < 0 && rowInfo.row.blkRating > -1 ? lightRed :
                        rowInfo.row.blkRating <= -1 && rowInfo.row.blkRating > -2 ? mediumRed : 
                        rowInfo.row.blkRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FG%',
            accessor: 'fgMixedRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.fgMixedRating > 2 ? brightGreen :
                        rowInfo.row.fgMixedRating > 1 ? mediumGreen : 
                        rowInfo.row.fgMixedRating >= .5 ? lightGreen : 
                        rowInfo.row.fgMixedRating < 0 && rowInfo.row.fgMixedRating > -1 ? lightRed :
                        rowInfo.row.fgMixedRating <= -1 && rowInfo.row.fgMixedRating > -2 ? mediumRed : 
                        rowInfo.row.fgMixedRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FT%',
            accessor: 'ftMixedRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.ftMixedRating > 2 ? brightGreen :
                        rowInfo.row.ftMixedRating > 1 ? mediumGreen : 
                        rowInfo.row.ftMixedRating >= .5 ? lightGreen : 
                        rowInfo.row.ftMixedRating < 0 && rowInfo.row.ftMixedRating > -1 ? lightRed :
                        rowInfo.row.ftMixedRating <= -1 && rowInfo.row.ftMixedRating > -2 ? mediumRed : 
                        rowInfo.row.ftMixedRating <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Turnovers',
            accessor: 'toRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.toRating > 2 ? brightGreen :
                        rowInfo.row.toRating > 1 ? mediumGreen : 
                        rowInfo.row.toRating >= .5 ? lightGreen : 
                        rowInfo.row.toRating < 0 && rowInfo.row.toRating > -1 ? lightRed :
                        rowInfo.row.toRating <= -1 && rowInfo.row.toRating > -2 ? mediumRed : 
                        rowInfo.row.toRating <= -2 ? brightRed : null,
                    },
                };
            },
        }];

        const columnNamesAvg = [{
            Header: 'Points',
            accessor: 'ptsRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.ptsRating > 1 ? brightGreen :
                        rowInfo.row.ptsRating > .5 ? mediumGreen : 
                        rowInfo.row.ptsRating >= .25 ? lightGreen : 
                        rowInfo.row.ptsRating < 0 && rowInfo.row.ptsRating > -0.25 ? lightRed :
                        rowInfo.row.ptsRating < -0.25 && rowInfo.row.ptsRating > -1 ? mediumRed : 
                        rowInfo.row.ptsRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: '3s',
            accessor: 'threeRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.threeRating > 1 ? brightGreen :
                        rowInfo.row.threeRating > .5 ? mediumGreen : 
                        rowInfo.row.threeRating >= .25 ? lightGreen : 
                        rowInfo.row.threeRating < 0 && rowInfo.row.threeRating > -0.25 ? lightRed :
                        rowInfo.row.threeRating < -0.25 && rowInfo.row.threeRating > -1 ? mediumRed : 
                        rowInfo.row.threeRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: 'rebRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.rebRating > 1 ? brightGreen :
                        rowInfo.row.rebRating > .5 ? mediumGreen : 
                        rowInfo.row.rebRating >= .25 ? lightGreen : 
                        rowInfo.row.rebRating < 0 && rowInfo.row.rebRating > -0.25 ? lightRed :
                        rowInfo.row.rebRating < -0.25 && rowInfo.row.rebRating > -1 ? mediumRed : 
                        rowInfo.row.rebRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: 'astRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.astRating > 1 ? brightGreen :
                        rowInfo.row.astRating > .5 ? mediumGreen : 
                        rowInfo.row.astRating >= .25 ? lightGreen : 
                        rowInfo.row.astRating < 0 && rowInfo.row.astRating > -0.25 ? lightRed :
                        rowInfo.row.astRating < -0.25 && rowInfo.row.astRating > -1 ? mediumRed : 
                        rowInfo.row.astRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: 'stlRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.stlRating > 1 ? brightGreen :
                        rowInfo.row.stlRating > .5 ? mediumGreen : 
                        rowInfo.row.stlRating >= .25 ? lightGreen : 
                        rowInfo.row.stlRating < 0 && rowInfo.row.stlRating > -0.25 ? lightRed :
                        rowInfo.row.stlRating < -0.25 && rowInfo.row.stlRating > -1 ? mediumRed : 
                        rowInfo.row.stlRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: 'blkRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.blkRating > 1 ? brightGreen :
                        rowInfo.row.blkRating > .5 ? mediumGreen : 
                        rowInfo.row.blkRating >= .25 ? lightGreen : 
                        rowInfo.row.blkRating < 0 && rowInfo.row.blkRating > -0.25 ? lightRed :
                        rowInfo.row.blkRating < -0.25 && rowInfo.row.blkRating > -1 ? mediumRed : 
                        rowInfo.row.blkRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FG%',
            accessor: 'fgMixedRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.fgMixedRating > 1 ? brightGreen :
                        rowInfo.row.fgMixedRating > .5 ? mediumGreen : 
                        rowInfo.row.fgMixedRating >= .25 ? lightGreen : 
                        rowInfo.row.fgMixedRating < 0 && rowInfo.row.fgMixedRating > -0.25 ? lightRed :
                        rowInfo.row.fgMixedRating < -0.25 && rowInfo.row.fgMixedRating > -1 ? mediumRed : 
                        rowInfo.row.fgMixedRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FT%',
            accessor: 'ftMixedRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.ftMixedRating > 1 ? brightGreen :
                        rowInfo.row.ftMixedRating > .5 ? mediumGreen : 
                        rowInfo.row.ftMixedRating >= .25 ? lightGreen : 
                        rowInfo.row.ftMixedRating < 0 && rowInfo.row.ftMixedRating > -0.25 ? lightRed :
                        rowInfo.row.ftMixedRating < -0.25 && rowInfo.row.ftMixedRating > -1 ? mediumRed : 
                        rowInfo.row.ftMixedRating <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Turnovers',
            accessor: 'toRating',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.toRating > 1 ? brightGreen :
                        rowInfo.row.toRating > .5 ? mediumGreen : 
                        rowInfo.row.toRating >= .25 ? lightGreen : 
                        rowInfo.row.toRating < 0 && rowInfo.row.toRating > -0.25 ? lightRed :
                        rowInfo.row.toRating < -0.25 && rowInfo.row.toRating > -1 ? mediumRed : 
                        rowInfo.row.toRating <= -1 ? brightRed : null,
                    },
                };
            },
        }];

        //Send to the compare teams component once we have the leagueId
        var compareTeamsHTML = "";
        if (this.state.leagueId) {
            compareTeamsHTML = <CompareTeams leagueId={this.state.leagueId} teams={this.state.teams} columnNames={columnNames}
            playerRankingsSeason={this.state.playerRankingsSeason} playerRankingsRecent={this.state.playerRankingsRecent} 
            columnNamesAvg={columnNamesAvg} />
        }

        return (
            <div className="table-container flex-vertical">
                <div className="table-group">
                    <h3 className="team-table-header">Teams Season Rankings</h3>
                    <div className="team-table">
                      <ReactTable
                        data={this.state.teamStatsSeason}
                        columns={columnNames}
                        showPagination={false}
                        minRows={0}
                        defaultSortDesc={true}
                        defaultSorted={[{
                            id: 'overallRank',
                            desc: false
                        }]}
                      />
                    </div>

                    {/* <h4 className="team-avg-header">Avg Season Rankings</h4> */}
                    <div className="team-avg-table">
                      <ReactTable
                        data={this.state.teamStatsSeasonAvg}
                        columns={columnNamesAvg}
                        showPagination={false}
                        minRows={0}
                      />
                    </div>
                </div>

                {compareTeamsHTML}

                <h3 className="team-table-header">Teams Recent Rankings</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.teamStatsRecent}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}
                  />
                </div>

                {/*<h4 className="team-avg-header">Avg Last 2 Weeks Rankings</h4> */}
                <div className="team-avg-table">
                  <ReactTable
                    data={this.state.teamStatsRecentAvg}
                    columns={columnNamesAvg}
                    showPagination={false}
                    minRows={0}
                  />
                </div>
                <h3 className="team-table-header">Season Potential Pickup Targets</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.playerPickupsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}
                  />
                </div>
                <h3 className="team-table-header">Recent Potential Pickup Targets</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.playerPickupsRecent}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}
                  />
                </div>
            </div>
        )
    }
}