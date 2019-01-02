import React, { Component } from 'react';
import Cookies from 'js-cookie';
import ReactTable from 'react-table';
import Select from 'react-select';
import 'react-table/react-table.css';
import stringSimilarity from 'string-similarity';
import { CompareTeams } from './CompareTeams';

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
            teamStatsTwoWeeks: [],
            teamStatsSeasonAvg: [],
            teamStatsTwoWeeksAvg: [],
            playerPickupsSeason: [],
            playerPickupsTwoWeeks: [],
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
            this.callApi('/api/targets/twoweeks/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsTwoWeeks: playerData });
                })
                .catch(err => console.log(err));

            //Targets from season ranking
            this.callApi('/api/targets/season/' + leagueId)
                .then(results => {
                    var playerData = results[0].players;
                    this.setState({ playerTargetsSeason: playerData });
                })
                .catch(err => console.log(err));

            this.callApi('/api/rankings/season/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsSeason: playerData });
                })
                .catch(err => console.log(err));

            this.callApi('/api/rankings/twoweeks/')
                .then(results => {
                    var playerData = results;
                    this.setState({ playerRankingsTwoWeeks: playerData });
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
        var teamStatsSeasonAvg = [];
        var teamStatsTwoWeeksAvg = [];
        var teamPickupsSeason = [];
        var teamPickupsTwoWeeks = [];
        var teamPlayers = this.state.teamPlayers;
        var playerRankingsSeason = this.state.playerRankingsSeason;
        var playerRankingsTwoWeeks = this.state.playerRankingsTwoWeeks;
        var playerPickupsSeason = this.state.playerTargetsSeason;
        var playerPickupsTwoWeeks = this.state.playerTargetsTwoWeeks;

        //for each player if string similarity > .7 in player rankings, then return
        for (var i = 0; i < teamPlayers.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarPlayerSeason = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsSeason[j].fullName);
                if (similarPlayerSeason > 0.7) {
                    teamStatsSeason.push(playerRankingsSeason[j]);
                    teamStatsSeasonAvg = {
                        pV: (teamStatsSeasonAvg.pV) ? (teamStatsSeasonAvg.pV + playerRankingsSeason[j].pV) : playerRankingsSeason[j].pV,
                        '3V': (teamStatsSeasonAvg['3V']) ? (teamStatsSeasonAvg['3V'] + playerRankingsSeason[j]['3V']) : playerRankingsSeason[j]['3V'],
                        aV: (teamStatsSeasonAvg.aV) ? (teamStatsSeasonAvg.aV + playerRankingsSeason[j].aV) : playerRankingsSeason[j].aV,
                        rV: (teamStatsSeasonAvg.rV) ? (teamStatsSeasonAvg.rV + playerRankingsSeason[j].rV) : playerRankingsSeason[j].rV,
                        sV: (teamStatsSeasonAvg.sV) ? (teamStatsSeasonAvg.sV + playerRankingsSeason[j].sV) : playerRankingsSeason[j].sV,
                        bV: (teamStatsSeasonAvg.bV) ? (teamStatsSeasonAvg.bV + playerRankingsSeason[j].bV) : playerRankingsSeason[j].bV,
                        'fg%V': (teamStatsSeasonAvg['fg%V']) ? (teamStatsSeasonAvg['fg%V'] + playerRankingsSeason[j]['fg%V']) : playerRankingsSeason[j]['fg%V'],
                        'ft%V': (teamStatsSeasonAvg['ft%V']) ? (teamStatsSeasonAvg['ft%V'] + playerRankingsSeason[j]['ft%V']) : playerRankingsSeason[j]['ft%V'],
                        toV: (teamStatsSeasonAvg.toV) ? (teamStatsSeasonAvg.toV + playerRankingsSeason[j].toV) : playerRankingsSeason[j].toV
                    }
                    break
                }
            }

            for (var j = 0; j < playerRankingsTwoWeeks.length; j++) {
                var similarPlayerTwoWeeks = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsTwoWeeks[j].fullName);
                if (similarPlayerTwoWeeks > 0.7) {
                    teamStatsTwoWeeks.push(playerRankingsTwoWeeks[j]);
                    teamStatsTwoWeeksAvg = {
                        pV: (teamStatsTwoWeeksAvg.pV) ? (teamStatsTwoWeeksAvg.pV + playerRankingsTwoWeeks[j].pV) : playerRankingsTwoWeeks[j].pV,
                        '3V': (teamStatsTwoWeeksAvg['3V']) ? (teamStatsTwoWeeksAvg['3V'] + playerRankingsTwoWeeks[j]['3V']) : playerRankingsTwoWeeks[j]['3V'],
                        aV: (teamStatsTwoWeeksAvg.aV) ? (teamStatsTwoWeeksAvg.aV + playerRankingsTwoWeeks[j].aV) : playerRankingsTwoWeeks[j].aV,
                        rV: (teamStatsTwoWeeksAvg.rV) ? (teamStatsTwoWeeksAvg.rV + playerRankingsTwoWeeks[j].rV) : playerRankingsTwoWeeks[j].rV,
                        sV: (teamStatsTwoWeeksAvg.sV) ? (teamStatsTwoWeeksAvg.sV + playerRankingsTwoWeeks[j].sV) : playerRankingsTwoWeeks[j].sV,
                        bV: (teamStatsTwoWeeksAvg.pV) ? (teamStatsTwoWeeksAvg.bV + playerRankingsTwoWeeks[j].bV) : playerRankingsTwoWeeks[j].bV,
                        'fg%V': (teamStatsTwoWeeksAvg['fg%V']) ? (teamStatsTwoWeeksAvg['fg%V'] + playerRankingsTwoWeeks[j]['fg%V']) : playerRankingsTwoWeeks[j]['fg%V'],
                        'ft%V': (teamStatsTwoWeeksAvg['ft%V']) ? (teamStatsTwoWeeksAvg['ft%V'] + playerRankingsTwoWeeks[j]['ft%V']) : playerRankingsTwoWeeks[j]['ft%V'],
                        toV: (teamStatsTwoWeeksAvg.toV) ? (teamStatsTwoWeeksAvg.toV + playerRankingsTwoWeeks[j].toV) : playerRankingsTwoWeeks[j].toV
                    }
                    break
                }
            }
        }

        for (var i = 0; i < playerPickupsSeason.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarTargetsSeason = stringSimilarity.compareTwoStrings(playerPickupsSeason[i].fullName, playerRankingsSeason[j].fullName);
                if (similarTargetsSeason > 0.7) {
                    teamPickupsSeason.push(playerRankingsSeason[j]);
                    break
                }
            }
        }

        for (var i = 0; i < playerPickupsTwoWeeks.length; i++) {
            for (var j = 0; j < playerRankingsTwoWeeks.length; j++) {
                var similarTargetsTwoWeeks = stringSimilarity.compareTwoStrings(playerPickupsTwoWeeks[i].fullName, playerRankingsTwoWeeks[j].fullName);
                if (similarTargetsTwoWeeks > 0.7) {
                    teamPickupsTwoWeeks.push(playerRankingsTwoWeeks[j]);
                    break
                }
            }
        }

        this.setState({ teamStatsSeason: teamStatsSeason });
        this.setState({ teamStatsTwoWeeks: teamStatsTwoWeeks });
        this.setState({ playerPickupsSeason: playerPickupsSeason });
        this.setState({ playerPickupsTwoWeeks: playerPickupsTwoWeeks });

        teamStatsSeasonAvg = {
            pV: Number(teamStatsSeasonAvg.pV / teamStatsSeason.length).toFixed(2),
            '3V': Number(teamStatsSeasonAvg['3V'] / teamStatsSeason.length).toFixed(2),
            aV: Number(teamStatsSeasonAvg.aV / teamStatsSeason.length).toFixed(2),
            rV: Number(teamStatsSeasonAvg.rV / teamStatsSeason.length).toFixed(2),
            sV: Number(teamStatsSeasonAvg.sV / teamStatsSeason.length).toFixed(2),
            bV: Number(teamStatsSeasonAvg.bV / teamStatsSeason.length).toFixed(2),
            'fg%V': Number(teamStatsSeasonAvg['fg%V'] / teamStatsSeason.length).toFixed(2),
            'ft%V': Number(teamStatsSeasonAvg['ft%V'] / teamStatsSeason.length).toFixed(2),
            toV: Number(teamStatsSeasonAvg.toV / teamStatsSeason.length).toFixed(2)
        }


        teamStatsTwoWeeksAvg = {
            pV: Number(teamStatsTwoWeeksAvg.pV / teamStatsTwoWeeks.length).toFixed(2),
            '3V': Number(teamStatsTwoWeeksAvg['3V'] / teamStatsTwoWeeks.length).toFixed(2),
            aV: Number(teamStatsTwoWeeksAvg.aV / teamStatsTwoWeeks.length).toFixed(2),
            rV: Number(teamStatsTwoWeeksAvg.rV / teamStatsTwoWeeks.length).toFixed(2),
            sV: Number(teamStatsTwoWeeksAvg.sV / teamStatsTwoWeeks.length).toFixed(2),
            bV: Number(teamStatsTwoWeeksAvg.bV / teamStatsTwoWeeks.length).toFixed(2),
            'fg%V': Number(teamStatsTwoWeeksAvg['fg%V'] / teamStatsTwoWeeks.length).toFixed(2),
            'ft%V': Number(teamStatsTwoWeeksAvg['ft%V'] / teamStatsTwoWeeks.length).toFixed(2),
            toV: Number(teamStatsTwoWeeksAvg.toV / teamStatsTwoWeeks.length).toFixed(2)
        }

        //Put the [] around the arrays so the table below can know its a single row
        this.setState({ teamStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ teamStatsTwoWeeksAvg: [teamStatsTwoWeeksAvg] });
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
            accessor: 'rank'
        }, {
            Header: 'Value',
            accessor: 'value'
        }, {
            Header: 'Name',
            accessor: 'fullName',
            width: 200
        }, {
            Header: 'Points',
            accessor: 'pV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.pV > 2 ? brightGreen :
                        rowInfo.row.pV > 1 ? mediumGreen : 
                        rowInfo.row.pV > .5 ? lightGreen : 
                        rowInfo.row.pV < 0 && rowInfo.row.pV > -1 ? lightRed :
                        rowInfo.row.pV < -1 && rowInfo.row.pV > -2 ? mediumRed : 
                        rowInfo.row.pV < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: '3s',
            accessor: '3V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['3V'] > 2 ? brightGreen :
                        rowInfo.row['3V'] > 1 ? mediumGreen : 
                        rowInfo.row['3V'] > .5 ? lightGreen : 
                        rowInfo.row['3V'] < 0 && rowInfo.row['3V'] > -1 ? lightRed :
                        rowInfo.row['3V'] < -1 && rowInfo.row['3V'] > -2 ? mediumRed : 
                        rowInfo.row['3V'] < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: 'rV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.rV > 2 ? brightGreen :
                        rowInfo.row.rV > 1 ? mediumGreen : 
                        rowInfo.row.rV > .5 ? lightGreen : 
                        rowInfo.row.rV < 0 && rowInfo.row.rV > -1 ? lightRed :
                        rowInfo.row.rV < -1 && rowInfo.row.rV > -2 ? mediumRed : 
                        rowInfo.row.rV < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: 'aV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.aV > 2 ? brightGreen :
                        rowInfo.row.aV > 1 ? mediumGreen : 
                        rowInfo.row.aV > .5 ? lightGreen : 
                        rowInfo.row.aV < 0 && rowInfo.row.aV > -1 ? lightRed :
                        rowInfo.row.aV < -1 && rowInfo.row.aV > -2 ? mediumRed : 
                        rowInfo.row.aV < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: 'sV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.sV > 2 ? brightGreen :
                        rowInfo.row.sV > 1 ? mediumGreen : 
                        rowInfo.row.sV > .5 ? lightGreen : 
                        rowInfo.row.sV < 0 && rowInfo.row.sV > -1 ? lightRed :
                        rowInfo.row.sV < -1 && rowInfo.row.sV > -2 ? mediumRed : 
                        rowInfo.row.sV < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: 'bV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.bV > 2 ? brightGreen :
                        rowInfo.row.bV > 1 ? mediumGreen : 
                        rowInfo.row.bV > .5 ? lightGreen : 
                        rowInfo.row.bV < 0 && rowInfo.row.bV > -1 ? lightRed :
                        rowInfo.row.bV < -1 && rowInfo.row.bV > -2 ? mediumRed : 
                        rowInfo.row.bV < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FG%',
            accessor: 'fg%V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['fg%V'] > 2 ? brightGreen :
                        rowInfo.row['fg%V'] > 1 ? mediumGreen : 
                        rowInfo.row['fg%V'] > .5 ? lightGreen : 
                        rowInfo.row['fg%V'] < 0 && rowInfo.row['fg%V'] > -1 ? lightRed :
                        rowInfo.row['fg%V'] < -1 && rowInfo.row['fg%V'] > -2 ? mediumRed : 
                        rowInfo.row['fg%V'] < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FT%',
            accessor: 'ft%V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['ft%V'] > 2 ? brightGreen :
                        rowInfo.row['ft%V'] > 1 ? mediumGreen : 
                        rowInfo.row['ft%V'] > .5 ? lightGreen : 
                        rowInfo.row['ft%V'] < 0 && rowInfo.row['ft%V'] > -1 ? lightRed :
                        rowInfo.row['ft%V'] < -1 && rowInfo.row['ft%V'] > -2 ? mediumRed : 
                        rowInfo.row['ft%V'] < -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Turnovers',
            accessor: 'toV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.toV > 2 ? brightGreen :
                        rowInfo.row.toV > 1 ? mediumGreen : 
                        rowInfo.row.toV > .5 ? lightGreen : 
                        rowInfo.row.toV < 0 && rowInfo.row.toV > -1 ? lightRed :
                        rowInfo.row.toV < -1 && rowInfo.row.toV > -2 ? mediumRed : 
                        rowInfo.row.toV < -2 ? brightRed : null,
                    },
                };
            },
        }];

        const columnNamesAvg = [{
            Header: 'Points',
            accessor: 'pV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.pV > 1 ? brightGreen :
                        rowInfo.row.pV > .5 ? mediumGreen : 
                        rowInfo.row.pV > .25 ? lightGreen : 
                        rowInfo.row.pV < 0 && rowInfo.row.pV > -0.25 ? lightRed :
                        rowInfo.row.pV < -0.25 && rowInfo.row.pV > -1 ? mediumRed : 
                        rowInfo.row.pV < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: '3s',
            accessor: '3V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['3V'] > 1 ? brightGreen :
                        rowInfo.row['3V'] > .5 ? mediumGreen : 
                        rowInfo.row['3V'] > .25 ? lightGreen : 
                        rowInfo.row['3V'] < 0 && rowInfo.row['3V'] > -0.25 ? lightRed :
                        rowInfo.row['3V'] < -0.25 && rowInfo.row['3V'] > -1 ? mediumRed : 
                        rowInfo.row['3V'] < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: 'rV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.rV > 1 ? brightGreen :
                        rowInfo.row.rV > .5 ? mediumGreen : 
                        rowInfo.row.rV > .25 ? lightGreen : 
                        rowInfo.row.rV < 0 && rowInfo.row.rV > -0.25 ? lightRed :
                        rowInfo.row.rV < -0.25 && rowInfo.row.rV > -1 ? mediumRed : 
                        rowInfo.row.rV < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: 'aV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.aV > 1 ? brightGreen :
                        rowInfo.row.aV > .5 ? mediumGreen : 
                        rowInfo.row.aV > .25 ? lightGreen : 
                        rowInfo.row.aV < 0 && rowInfo.row.aV > -0.25 ? lightRed :
                        rowInfo.row.aV < -0.25 && rowInfo.row.aV > -1 ? mediumRed : 
                        rowInfo.row.aV < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: 'sV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.sV > 1 ? brightGreen :
                        rowInfo.row.sV > .5 ? mediumGreen : 
                        rowInfo.row.sV > .25 ? lightGreen : 
                        rowInfo.row.sV < 0 && rowInfo.row.sV > -0.25 ? lightRed :
                        rowInfo.row.sV < -0.25 && rowInfo.row.sV > -1 ? mediumRed : 
                        rowInfo.row.sV < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: 'bV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.bV > 1 ? brightGreen :
                        rowInfo.row.bV > .5 ? mediumGreen : 
                        rowInfo.row.bV > .25 ? lightGreen : 
                        rowInfo.row.bV < 0 && rowInfo.row.bV > -0.25 ? lightRed :
                        rowInfo.row.bV < -0.25 && rowInfo.row.bV > -1 ? mediumRed : 
                        rowInfo.row.bV < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FG%',
            accessor: 'fg%V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['fg%V'] > 1 ? brightGreen :
                        rowInfo.row['fg%V'] > .5 ? mediumGreen : 
                        rowInfo.row['fg%V'] > .25 ? lightGreen : 
                        rowInfo.row['fg%V'] < 0 && rowInfo.row['fg%V'] > -0.25 ? lightRed :
                        rowInfo.row['fg%V'] < -0.25 && rowInfo.row['fg%V'] > -1 ? mediumRed : 
                        rowInfo.row['fg%V'] < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FT%',
            accessor: 'ft%V',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row['ft%V'] > 1 ? brightGreen :
                        rowInfo.row['ft%V'] > .5 ? mediumGreen : 
                        rowInfo.row['ft%V'] > .25 ? lightGreen : 
                        rowInfo.row['ft%V'] < 0 && rowInfo.row['ft%V'] > -0.25 ? lightRed :
                        rowInfo.row['ft%V'] < -0.25 && rowInfo.row['ft%V'] > -1 ? mediumRed : 
                        rowInfo.row['ft%V'] < -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Turnovers',
            accessor: 'toV',
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row.toV > 1 ? brightGreen :
                        rowInfo.row.toV > .5 ? mediumGreen : 
                        rowInfo.row.toV > .25 ? lightGreen : 
                        rowInfo.row.toV < 0 && rowInfo.row.toV > -0.25 ? lightRed :
                        rowInfo.row.toV < -0.25 && rowInfo.row.toV > -1 ? mediumRed : 
                        rowInfo.row.toV < -1 ? brightRed : null,
                    },
                };
            },
        }];

        //Send to the compare teams component once we have the leagueId
        var compareTeamsHTML = "";
        if (this.state.leagueId) {
            compareTeamsHTML = <CompareTeams leagueId={this.state.leagueId} teams={this.state.teams} columnNames={columnNames}
            playerRankingsSeason={this.state.playerRankingsSeason} playerRankingsTwoWeeks={this.state.playerRankingsTwoWeeks} 
            columnNamesAvg={columnNamesAvg} />
        }

        return (
            <div className="table-container flex-vertical">
                <div className="table-group">
                    <h3 className="team-table-header">Season Rankings</h3>
                    <div className="team-table">
                      <ReactTable
                        data={this.state.teamStatsSeason}
                        columns={columnNames}
                        showPagination={false}
                        minRows={0}
                        defaultSortDesc={true}
                        defaultSorted={[{
                            id: 'rank',
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

                <h3 className="team-table-header">Last 2 Weeks Rankings</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.teamStatsTwoWeeks}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'rank',
                        desc: false
                    }]}
                  />
                </div>

                {/*<h4 className="team-avg-header">Avg Last 2 Weeks Rankings</h4> */}
                <div className="team-avg-table">
                  <ReactTable
                    data={this.state.teamStatsTwoWeeksAvg}
                    columns={columnNamesAvg}
                    showPagination={false}
                    minRows={0}
                  />
                </div>
                <h3 className="team-table-header">Season Pickup Targets</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.playerPickupsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'rank',
                        desc: false
                    }]}
                  />
                </div>
                <h3 className="team-table-header">Last 2 Weeks Pickup Targets</h3>
                <div className="team-table">
                  <ReactTable
                    data={this.state.playerPickupsTwoWeeks}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'rank',
                        desc: false
                    }]}
                  />
                </div>
            </div>
        )
    }
}