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
            teamStatsTwoWeeks: [],
            teamStatsSeasonAvg: [],
            teamStatsTwoWeeksAvg: []
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
        var teamPlayers = this.state.teamPlayers;
        var playerRankingsSeason = this.state.playerRankingsSeason;
        var playerRankingsTwoWeeks = this.state.playerRankingsTwoWeeks;

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

            for (var k = 0; k < playerRankingsTwoWeeks.length; k++) {
                var similarPlayerTwoWeeks = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsTwoWeeks[k].fullName);
                if (similarPlayerTwoWeeks > 0.7) {
                    teamStatsTwoWeeks.push(playerRankingsTwoWeeks[k]);
                    teamStatsTwoWeeksAvg = {
                        pV: (teamStatsTwoWeeksAvg.pV) ? (teamStatsTwoWeeksAvg.pV + playerRankingsTwoWeeks[k].pV) : playerRankingsTwoWeeks[k].pV,
                        '3V': (teamStatsTwoWeeksAvg['3V']) ? (teamStatsTwoWeeksAvg['3V'] + playerRankingsTwoWeeks[k]['3V']) : playerRankingsTwoWeeks[k]['3V'],
                        aV: (teamStatsTwoWeeksAvg.aV) ? (teamStatsTwoWeeksAvg.aV + playerRankingsTwoWeeks[k].aV) : playerRankingsTwoWeeks[k].aV,
                        rV: (teamStatsTwoWeeksAvg.rV) ? (teamStatsTwoWeeksAvg.rV + playerRankingsTwoWeeks[k].rV) : playerRankingsTwoWeeks[k].rV,
                        sV: (teamStatsTwoWeeksAvg.sV) ? (teamStatsTwoWeeksAvg.sV + playerRankingsTwoWeeks[k].sV) : playerRankingsTwoWeeks[k].sV,
                        bV: (teamStatsTwoWeeksAvg.pV) ? (teamStatsTwoWeeksAvg.bV + playerRankingsTwoWeeks[k].bV) : playerRankingsTwoWeeks[k].bV,
                        'fg%V': (teamStatsTwoWeeksAvg['fg%V']) ? (teamStatsTwoWeeksAvg['fg%V'] + playerRankingsTwoWeeks[k]['fg%V']) : playerRankingsTwoWeeks[k]['fg%V'],
                        'ft%V': (teamStatsTwoWeeksAvg['ft%V']) ? (teamStatsTwoWeeksAvg['ft%V'] + playerRankingsTwoWeeks[k]['ft%V']) : playerRankingsTwoWeeks[k]['ft%V'],
                        toV: (teamStatsTwoWeeksAvg.toV) ? (teamStatsTwoWeeksAvg.toV + playerRankingsTwoWeeks[k].toV) : playerRankingsTwoWeeks[k].toV
                    }
                    break
                }
            }
        }

        this.setState({ teamStatsSeason: teamStatsSeason });
        this.setState({ teamStatsTwoWeeks: teamStatsTwoWeeks });

        teamStatsSeasonAvg = {
            pV: Number(teamStatsSeasonAvg.pV/teamStatsSeason.length).toFixed(2),
            '3V': Number(teamStatsSeasonAvg['3V']/teamStatsSeason.length).toFixed(2),
            aV: Number(teamStatsSeasonAvg.aV/teamStatsSeason.length).toFixed(2),
            rV: Number(teamStatsSeasonAvg.rV/teamStatsSeason.length).toFixed(2),
            sV: Number(teamStatsSeasonAvg.sV/teamStatsSeason.length).toFixed(2),
            bV: Number(teamStatsSeasonAvg.bV/teamStatsSeason.length).toFixed(2),
            'fg%V': Number(teamStatsSeasonAvg['fg%V']/teamStatsSeason.length).toFixed(2),
            'ft%V': Number(teamStatsSeasonAvg['ft%V']/teamStatsSeason.length).toFixed(2),
            toV: Number(teamStatsSeasonAvg.toV/teamStatsSeason.length).toFixed(2)
        }
        

        teamStatsTwoWeeksAvg = {
            pV: Number(teamStatsTwoWeeksAvg.pV/teamStatsTwoWeeks.length).toFixed(2),
            '3V': Number(teamStatsTwoWeeksAvg['3V']/teamStatsTwoWeeks.length).toFixed(2),
            aV: Number(teamStatsTwoWeeksAvg.aV/teamStatsTwoWeeks.length).toFixed(2),
            rV: Number(teamStatsTwoWeeksAvg.rV/teamStatsTwoWeeks.length).toFixed(2),
            sV: Number(teamStatsTwoWeeksAvg.sV/teamStatsTwoWeeks.length).toFixed(2),
            bV: Number(teamStatsTwoWeeksAvg.bV/teamStatsTwoWeeks.length).toFixed(2),
            'fg%V': Number(teamStatsTwoWeeksAvg['fg%V']/teamStatsTwoWeeks.length).toFixed(2),
            'ft%V': Number(teamStatsTwoWeeksAvg['ft%V']/teamStatsTwoWeeks.length).toFixed(2),
            toV: Number(teamStatsTwoWeeksAvg.toV/teamStatsTwoWeeks.length).toFixed(2)
        }

        //Put the [] around the arrays so the table below can know its a single row
        this.setState({ teamStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ teamStatsTwoWeeksAvg: [teamStatsTwoWeeksAvg] });
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

        const columnNamesAvg = [{
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
            <div className="table-container flex-vertical">
                <h3 className="team-table-header">Season Rankings</h3>
                <div className="team-table">
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

                <h4 className="team-avg-header">Avg Season Rankings</h4>
                <div className="team-avg-table">
                  <ReactTable
                    data={this.state.teamStatsSeasonAvg}
                    columns={columnNamesAvg}
                    showPagination={false}
                    minRows={0}
                  />
                </div>

                <h3 className="team-table-header">Last 2 Weeks Rankings</h3>
                <div className="team-table">
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

                <h4 className="team-avg-header">Avg Last 2 Weeks Rankings</h4>
                <div className="team-avg-table">
                  <ReactTable
                    data={this.state.teamStatsTwoWeeksAvg}
                    columns={columnNamesAvg}
                    showPagination={false}
                    minRows={0}
                  />
                </div>
            <div className="players-container flex">
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