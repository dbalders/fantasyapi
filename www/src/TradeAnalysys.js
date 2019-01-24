import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import Cookies from 'js-cookie';
import Select from 'react-select';
import stringSimilarity from 'string-similarity';
import { callApi } from './CallApi';

export class TradeAnalysis extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leagueId: [],
            teamId: [],
            teams: [],
            teamStatsSeason: [],
            teamStatsRecent: [],
            teamStatsSeasonAvg: [],
            teamStatsRecentAvg: [],
            playerRankingsSeason: [],
            playerRankingsRecent: [],
            compareStatsSeason: [],
            compareStatsRecent: [],
            teamSelected: [],
            teamPlayers: [],
            showCompareTable: false,
            teamTradeStatsSeason: [],
            oppTeamTradeStatsSeason: [],
            teamTradeImprovement: [],
            selected: [],
            selectedOpp: [],
            updateCompareTable: false
        }
        this.hideCompareTable = this.hideCompareTable.bind(this);
    }

    componentDidMount() {
        var leagueId = Cookies.get('leagueId');
        var teamId = Cookies.get('teamId');
        var seasonStats = JSON.parse(localStorage.getItem('teamStatsSeason'));
        var recentStats = JSON.parse(localStorage.getItem('teamStatsRecent'));
        var seasonAvg = JSON.parse(localStorage.getItem('teamStatsSeasonAvg'));
        var recentAvg = JSON.parse(localStorage.getItem('teamStatsRecentAvg'));

        var teamTradeImprovement = []
        teamTradeImprovement.push({
            name: 'Plus/Minus',
            overallRating: 0,
            ptsRating: 0,
            threeRating: 0,
            astRating: 0,
            rebRating: 0,
            stlRating: 0,
            blkRating: 0,
            fgMixedRating: 0,
            ftMixedRating: 0,
            toRating: 0
        });

        teamTradeImprovement.push({
            name: 'Team values',
            overallRating: seasonAvg[0].overallRating,
            ptsRating: seasonAvg[0].ptsRating,
            threeRating: seasonAvg[0].threeRating,
            astRating: seasonAvg[0].astRating,
            rebRating: seasonAvg[0].rebRating,
            stlRating: seasonAvg[0].stlRating,
            blkRating: seasonAvg[0].blkRating,
            fgMixedRating: seasonAvg[0].fgMixedRating,
            ftMixedRating: seasonAvg[0].ftMixedRating,
            toRating: seasonAvg[0].toRating
        })

        //If any of these do not exist somehow (not sure how, but still), redirect to home page to be rebuilt
        if (seasonStats === null || recentStats === null || seasonAvg === null || recentAvg === null) {
            window.location = "/";
        } else {
            this.setState({
                leagueId: leagueId,
                teamId: teamId,
                teamStatsSeason: seasonStats,
                teamStatsRecent: recentStats,
                teamStatsSeasonAvg: seasonAvg,
                teamStatsRecentAvg: recentAvg,
                playerRankingsSeason: JSON.parse(localStorage.getItem('playerRankingsSeason')),
                playerRankingsRecent: JSON.parse(localStorage.getItem('playerRankingsRecent')),
                teams: JSON.parse(localStorage.getItem('teams')),
                teamTradeImprovement: teamTradeImprovement
            });
        }
    }

    handleTeamChange = (teamSelected) => {
        this.setState({ teamSelected });
        callApi('/api/teams/' + this.state.leagueId + '/' + teamSelected.value)
            .then(results => {
                this.setState({ showCompareTable: true });
                this.setState({ teamPlayers: results }, function () {
                    this.buildTradeTeam(this.state.teamPlayers);
                })
            })
            .catch(err => console.log(err));
    }

    //hide the compare table when clicked
    hideCompareTable() {
        this.setState({ showCompareTable: false })
    }

    buildTradeTeam(team) {
        var teamStatsSeason = [];
        var teamStatsRecent = [];
        var teamStatsSeasonAvg = [];
        var teamStatsRecentAvg = [];
        var teamPlayers = team;
        var playerRankingsSeason = this.state.playerRankingsSeason;
        var playerRankingsRecent = this.state.playerRankingsRecent;

        //for each player on the team, if string similarity > .7 in the player rankings, then add that player to the array
        for (var i = 0; i < teamPlayers.length; i++) {
            for (var j = 0; j < playerRankingsSeason.length; j++) {
                var similarPlayerSeason = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsSeason[j].playerName);
                if (similarPlayerSeason > 0.7) {
                    //Push the player to the team array
                    teamStatsSeason.push(playerRankingsSeason[j]);
                    //Start calculating averages by adding them all up
                    teamStatsSeasonAvg = {
                        overallRating: (teamStatsSeasonAvg.overallRating) ? (teamStatsSeasonAvg.overallRating + playerRankingsSeason[j].overallRating) : playerRankingsSeason[j].overallRating,
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

            //Same here for recent data
            for (var j = 0; j < playerRankingsRecent.length; j++) {
                var similarPlayerRecent = stringSimilarity.compareTwoStrings(teamPlayers[i].full, playerRankingsRecent[j].playerName);
                if (similarPlayerRecent > 0.7) {
                    teamStatsRecent.push(playerRankingsRecent[j]);
                    teamStatsRecentAvg = {
                        overallRating: (teamStatsRecentAvg.overallRating) ? (teamStatsRecentAvg.overallRating + playerRankingsRecent[j].overallRating) : playerRankingsRecent[j].overallRating,
                        ptsRating: (teamStatsRecentAvg.ptsRating) ? (teamStatsRecentAvg.ptsRating + playerRankingsRecent[j].ptsRating) : playerRankingsRecent[j].ptsRating,
                        threeRating: (teamStatsRecentAvg.threeRating) ? (teamStatsRecentAvg.threeRating + playerRankingsRecent[j].threeRating) : playerRankingsRecent[j].threeRating,
                        astRating: (teamStatsRecentAvg.astRating) ? (teamStatsRecentAvg.astRating + playerRankingsRecent[j].astRating) : playerRankingsRecent[j].astRating,
                        rebRating: (teamStatsRecentAvg.rebRating) ? (teamStatsRecentAvg.rebRating + playerRankingsRecent[j].rebRating) : playerRankingsRecent[j].rebRating,
                        stlRating: (teamStatsRecentAvg.stlRating) ? (teamStatsRecentAvg.stlRating + playerRankingsRecent[j].stlRating) : playerRankingsRecent[j].stlRating,
                        blkRating: (teamStatsRecentAvg.blkRating) ? (teamStatsRecentAvg.blkRating + playerRankingsRecent[j].blkRating) : playerRankingsRecent[j].blkRating,
                        fgMixedRating: (teamStatsRecentAvg.fgMixedRating) ? (teamStatsRecentAvg.fgMixedRating + playerRankingsRecent[j].fgMixedRating) : playerRankingsRecent[j].fgMixedRating,
                        ftMixedRating: (teamStatsRecentAvg.ftMixedRating) ? (teamStatsRecentAvg.ftMixedRating + playerRankingsRecent[j].ftMixedRating) : playerRankingsRecent[j].ftMixedRating,
                        toRating: (teamStatsRecentAvg.toRating) ? (teamStatsRecentAvg.toRating + playerRankingsRecent[j].toRating) : playerRankingsRecent[j].toRating
                    }
                    break
                }
            }
        }

        this.setState({ compareStatsSeason: teamStatsSeason });
        this.setState({ compareStatsRecent: teamStatsRecent });

        //Divide averages total by the number of players they have to get avg number
        teamStatsSeasonAvg = {
            overallRating: Number(teamStatsSeasonAvg.overallRating / teamStatsSeason.length).toFixed(2),
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
            overallRating: Number(teamStatsRecentAvg.overallRating / teamStatsRecent.length).toFixed(2),
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
        this.setState({ compareStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ compareStatsRecentAvg: [teamStatsRecentAvg] });
    }

    addToTeamTrade(rowInfo) {
        var teamTradeArray = this.state.teamTradeStatsSeason;
        teamTradeArray.push(rowInfo.original);
        this.setState({ teamTradeStatsSeason: teamTradeArray });
        this.updateImprovementTable(rowInfo, true, true);
    }

    removeFromTeamTrade(rowInfo) {
        var playerId = rowInfo.original._id;
        var teamTradeArray = this.state.teamTradeStatsSeason;
        for (var i = 0; i < teamTradeArray.length; i++) {
            if (rowInfo.original._id === teamTradeArray[i]._id) {
                teamTradeArray.splice(i, 1);
            }
        }

        this.setState({ teamTradeStatsSeason: teamTradeArray });
        this.updateImprovementTable(rowInfo, false, true);
    }

    addToOppTeamTrade(rowInfo) {
        var teamTradeArray = this.state.oppTeamTradeStatsSeason;
        teamTradeArray.push(rowInfo.original);
        this.setState({ oppTeamTradeStatsSeason: teamTradeArray });
        this.updateImprovementTable(rowInfo, true, false);
    }

    removeFromOppTeamTrade(rowInfo) {
        var playerId = rowInfo.original._id;
        var teamTradeArray = this.state.oppTeamTradeStatsSeason;
        for (var i = 0; i < teamTradeArray.length; i++) {
            if (rowInfo.original._id === teamTradeArray[i]._id) {
                teamTradeArray.splice(i, 1);
            }
        }

        this.setState({ oppTeamTradeStatsSeason: teamTradeArray });
        this.updateImprovementTable(rowInfo, false, false);
    }

    updateImprovementTable(rowInfo, add, ownedTeam) {
        var teamTradeImprovement = [];
        var teamTradeImprovementOrig = this.state.teamTradeImprovement;

        if ((add && ownedTeam) || (!add && !ownedTeam)) {
            teamTradeImprovement.push({
                name: 'Plus/Minus',
                overallRating: Number(parseFloat(this.state.teamTradeImprovement[0].overallRating) - rowInfo.original.overallRating).toFixed(2),
                ptsRating: Number(parseFloat(this.state.teamTradeImprovement[0].ptsRating) - rowInfo.original.ptsRating).toFixed(2),
                threeRating: Number(parseFloat(this.state.teamTradeImprovement[0].threeRating) - rowInfo.original.threeRating).toFixed(2),
                astRating: Number(parseFloat(this.state.teamTradeImprovement[0].astRating) - rowInfo.original.astRating).toFixed(2),
                rebRating: Number(parseFloat(this.state.teamTradeImprovement[0].rebRating) - rowInfo.original.rebRating).toFixed(2),
                stlRating: Number(parseFloat(this.state.teamTradeImprovement[0].stlRating) - rowInfo.original.stlRating).toFixed(2),
                blkRating: Number(parseFloat(this.state.teamTradeImprovement[0].blkRating) - rowInfo.original.blkRating).toFixed(2),
                fgMixedRating: Number(parseFloat(this.state.teamTradeImprovement[0].fgMixedRating) - rowInfo.original.fgMixedRating).toFixed(2),
                ftMixedRating: Number(parseFloat(this.state.teamTradeImprovement[0].ftMixedRating) - rowInfo.original.ftMixedRating).toFixed(2),
                toRating: Number(parseFloat(this.state.teamTradeImprovement[0].toRating) - rowInfo.original.toRating).toFixed(2)
            });

            teamTradeImprovement.push({
                name: 'Team values',
                overallRating: Number(parseFloat(this.state.teamTradeImprovement[1].overallRating) - rowInfo.original.overallRating).toFixed(2),
                ptsRating: Number(parseFloat(this.state.teamTradeImprovement[1].ptsRating) - rowInfo.original.ptsRating).toFixed(2),
                threeRating: Number(parseFloat(this.state.teamTradeImprovement[1].threeRating) - rowInfo.original.threeRating).toFixed(2),
                astRating: Number(parseFloat(this.state.teamTradeImprovement[1].astRating) - rowInfo.original.astRating).toFixed(2),
                rebRating: Number(parseFloat(this.state.teamTradeImprovement[1].rebRating) - rowInfo.original.rebRating).toFixed(2),
                stlRating: Number(parseFloat(this.state.teamTradeImprovement[1].stlRating) - rowInfo.original.stlRating).toFixed(2),
                blkRating: Number(parseFloat(this.state.teamTradeImprovement[1].blkRating) - rowInfo.original.blkRating).toFixed(2),
                fgMixedRating: Number(parseFloat(this.state.teamTradeImprovement[1].fgMixedRating) - rowInfo.original.fgMixedRating).toFixed(2),
                ftMixedRating: Number(parseFloat(this.state.teamTradeImprovement[1].ftMixedRating) - rowInfo.original.ftMixedRating).toFixed(2),
                toRating: Number(parseFloat(this.state.teamTradeImprovement[1].toRating) - rowInfo.original.toRating).toFixed(2)
            })
        } else {
            teamTradeImprovement.push({
                name: 'Plus/Minus',
                overallRating: Number(parseFloat(this.state.teamTradeImprovement[0].overallRating) + rowInfo.original.overallRating).toFixed(2),
                ptsRating: Number(parseFloat(this.state.teamTradeImprovement[0].ptsRating) + rowInfo.original.ptsRating).toFixed(2),
                threeRating: Number(parseFloat(this.state.teamTradeImprovement[0].threeRating) + rowInfo.original.threeRating).toFixed(2),
                astRating: Number(parseFloat(this.state.teamTradeImprovement[0].astRating) + rowInfo.original.astRating).toFixed(2),
                rebRating: Number(parseFloat(this.state.teamTradeImprovement[0].rebRating) + rowInfo.original.rebRating).toFixed(2),
                stlRating: Number(parseFloat(this.state.teamTradeImprovement[0].stlRating) + rowInfo.original.stlRating).toFixed(2),
                blkRating: Number(parseFloat(this.state.teamTradeImprovement[0].blkRating) + rowInfo.original.blkRating).toFixed(2),
                fgMixedRating: Number(parseFloat(this.state.teamTradeImprovement[0].fgMixedRating) + rowInfo.original.fgMixedRating).toFixed(2),
                ftMixedRating: Number(parseFloat(this.state.teamTradeImprovement[0].ftMixedRating) + rowInfo.original.ftMixedRating).toFixed(2),
                toRating: Number(parseFloat(this.state.teamTradeImprovement[0].toRating) + rowInfo.original.toRating).toFixed(2)
            });

            teamTradeImprovement.push({
                name: 'Team values',
                overallRating: Number(parseFloat(this.state.teamTradeImprovement[1].overallRating) + rowInfo.original.overallRating).toFixed(2),
                ptsRating: Number(parseFloat(this.state.teamTradeImprovement[1].ptsRating) + rowInfo.original.ptsRating).toFixed(2),
                threeRating: Number(parseFloat(this.state.teamTradeImprovement[1].threeRating) + rowInfo.original.threeRating).toFixed(2),
                astRating: Number(parseFloat(this.state.teamTradeImprovement[1].astRating) + rowInfo.original.astRating).toFixed(2),
                rebRating: Number(parseFloat(this.state.teamTradeImprovement[1].rebRating) + rowInfo.original.rebRating).toFixed(2),
                stlRating: Number(parseFloat(this.state.teamTradeImprovement[1].stlRating) + rowInfo.original.stlRating).toFixed(2),
                blkRating: Number(parseFloat(this.state.teamTradeImprovement[1].blkRating) + rowInfo.original.blkRating).toFixed(2),
                fgMixedRating: Number(parseFloat(this.state.teamTradeImprovement[1].fgMixedRating) + rowInfo.original.fgMixedRating).toFixed(2),
                ftMixedRating: Number(parseFloat(this.state.teamTradeImprovement[1].ftMixedRating) + rowInfo.original.ftMixedRating).toFixed(2),
                toRating: Number(parseFloat(this.state.teamTradeImprovement[1].toRating) + rowInfo.original.toRating).toFixed(2)
            })
        }

        this.setState({ teamTradeImprovement, teamTradeImprovement });

    }

    render() {
        var nameHeader = 'playerName';
        var rankHeader = 'overallRank';
        var ratingHeader = 'overallRating';
        var ptsHeader = 'ptsRating';
        var threesHeader = 'threeRating';
        var rebHeader = 'rebRating';
        var astHeader = 'astRating';
        var stlHeader = 'stlRating';
        var blkHeader = 'blkRating';
        var ftHeader = 'ftMixedRating';
        var fgHeader = 'fgMixedRating';
        var toHeader = 'toRating';
        const brightGreen = '#3ffc3f';
        const mediumGreen = '#85fc85';
        const lightGreen = '#b9ffb9';
        const lightRed = '#ffdfdf';
        const mediumRed = '#ffb8b8';
        const brightRed = '#ff8282';

        const { teamSelected } = this.state;
        const teamSelect = [];

        //Get the team names from a prop and push it into teamSelect for select dropdown
        for (var i = 0; i < this.state.teams.length; i++) {
            teamSelect.push({ value: this.state.teams[i].team_id, label: this.state.teams[i].name })
        }

        //If the parent says to update the table, rebuild the table with new data
        if ((this.state.updateCompareTable)) {
            this.buildTradeTeam(this.state.teamPlayers);
        }


        const columnNames = [{
            Header: 'Rank',
            accessor: rankHeader,
            className: "center"
        }, {
            Header: 'Value',
            accessor: ratingHeader,
            className: "center"
        }, {
            Header: 'Name',
            accessor: nameHeader,
            width: 200,
            className: "center"
        }, {
            Header: 'Points',
            accessor: ptsHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[ptsHeader] > 2 ? brightGreen :
                            rowInfo.row[ptsHeader] > 1 ? mediumGreen :
                                rowInfo.row[ptsHeader] >= .5 ? lightGreen :
                                    rowInfo.row[ptsHeader] < 0 && rowInfo.row[ptsHeader] > -1 ? lightRed :
                                        rowInfo.row[ptsHeader] <= -1 && rowInfo.row[ptsHeader] > -2 ? mediumRed :
                                            rowInfo.row[ptsHeader] <= -2 ? brightRed : null,
                    }
                };
            },

        }, {
            Header: '3s',
            accessor: threesHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[threesHeader] > 2 ? brightGreen :
                            rowInfo.row[threesHeader] > 1 ? mediumGreen :
                                rowInfo.row[threesHeader] >= .5 ? lightGreen :
                                    rowInfo.row[threesHeader] < 0 && rowInfo.row[threesHeader] > -1 ? lightRed :
                                        rowInfo.row[threesHeader] <= -1 && rowInfo.row[threesHeader] > -2 ? mediumRed :
                                            rowInfo.row[threesHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: rebHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[rebHeader] > 2 ? brightGreen :
                            rowInfo.row[rebHeader] > 1 ? mediumGreen :
                                rowInfo.row[rebHeader] >= .5 ? lightGreen :
                                    rowInfo.row[rebHeader] < 0 && rowInfo.row[rebHeader] > -1 ? lightRed :
                                        rowInfo.row[rebHeader] <= -1 && rowInfo.row[rebHeader] > -2 ? mediumRed :
                                            rowInfo.row[rebHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: astHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[astHeader] > 2 ? brightGreen :
                            rowInfo.row[astHeader] > 1 ? mediumGreen :
                                rowInfo.row[astHeader] >= .5 ? lightGreen :
                                    rowInfo.row[astHeader] < 0 && rowInfo.row[astHeader] > -1 ? lightRed :
                                        rowInfo.row[astHeader] <= -1 && rowInfo.row[astHeader] > -2 ? mediumRed :
                                            rowInfo.row[astHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: stlHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[stlHeader] > 2 ? brightGreen :
                            rowInfo.row[stlHeader] > 1 ? mediumGreen :
                                rowInfo.row[stlHeader] >= .5 ? lightGreen :
                                    rowInfo.row[stlHeader] < 0 && rowInfo.row[stlHeader] > -1 ? lightRed :
                                        rowInfo.row[stlHeader] <= -1 && rowInfo.row[stlHeader] > -2 ? mediumRed :
                                            rowInfo.row[stlHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: blkHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[blkHeader] > 2 ? brightGreen :
                            rowInfo.row[blkHeader] > 1 ? mediumGreen :
                                rowInfo.row[blkHeader] >= .5 ? lightGreen :
                                    rowInfo.row[blkHeader] < 0 && rowInfo.row[blkHeader] > -1 ? lightRed :
                                        rowInfo.row[blkHeader] <= -1 && rowInfo.row[blkHeader] > -2 ? mediumRed :
                                            rowInfo.row[blkHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FG%',
            accessor: fgHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[fgHeader] > 2 ? brightGreen :
                            rowInfo.row[fgHeader] > 1 ? mediumGreen :
                                rowInfo.row[fgHeader] >= .5 ? lightGreen :
                                    rowInfo.row[fgHeader] < 0 && rowInfo.row[fgHeader] > -1 ? lightRed :
                                        rowInfo.row[fgHeader] <= -1 && rowInfo.row[fgHeader] > -2 ? mediumRed :
                                            rowInfo.row[fgHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'FT%',
            accessor: ftHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[ftHeader] > 2 ? brightGreen :
                            rowInfo.row[ftHeader] > 1 ? mediumGreen :
                                rowInfo.row[ftHeader] >= .5 ? lightGreen :
                                    rowInfo.row[ftHeader] < 0 && rowInfo.row[ftHeader] > -1 ? lightRed :
                                        rowInfo.row[ftHeader] <= -1 && rowInfo.row[ftHeader] > -2 ? mediumRed :
                                            rowInfo.row[ftHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Turnovers',
            accessor: toHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[toHeader] > 2 ? brightGreen :
                            rowInfo.row[toHeader] > 1 ? mediumGreen :
                                rowInfo.row[toHeader] >= .5 ? lightGreen :
                                    rowInfo.row[toHeader] < 0 && rowInfo.row[toHeader] > -1 ? lightRed :
                                        rowInfo.row[toHeader] <= -1 && rowInfo.row[toHeader] > -2 ? mediumRed :
                                            rowInfo.row[toHeader] <= -2 ? brightRed : null,
                    },
                };
            },
        }];

        //column names for the average tables
        const columnNamesAvg = [{
            Header: '',
            accessor: 'name',
            className: "center"
        }, {
            Header: 'Overall Value',
            accessor: ratingHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[ptsHeader] > 1 ? brightGreen :
                            rowInfo.row[ptsHeader] > .5 ? mediumGreen :
                                rowInfo.row[ptsHeader] >= .25 ? lightGreen :
                                    rowInfo.row[ptsHeader] < 0 && rowInfo.row[ptsHeader] > -0.25 ? lightRed :
                                        rowInfo.row[ptsHeader] < -0.25 && rowInfo.row[ptsHeader] > -1 ? mediumRed :
                                            rowInfo.row[ptsHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Points',
            accessor: ptsHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[ptsHeader] > 1 ? brightGreen :
                            rowInfo.row[ptsHeader] > .5 ? mediumGreen :
                                rowInfo.row[ptsHeader] >= .25 ? lightGreen :
                                    rowInfo.row[ptsHeader] < 0 && rowInfo.row[ptsHeader] > -0.25 ? lightRed :
                                        rowInfo.row[ptsHeader] < -0.25 && rowInfo.row[ptsHeader] > -1 ? mediumRed :
                                            rowInfo.row[ptsHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: '3s',
            accessor: threesHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[threesHeader] > 1 ? brightGreen :
                            rowInfo.row[threesHeader] > .5 ? mediumGreen :
                                rowInfo.row[threesHeader] >= .25 ? lightGreen :
                                    rowInfo.row[threesHeader] < 0 && rowInfo.row[threesHeader] > -0.25 ? lightRed :
                                        rowInfo.row[threesHeader] < -0.25 && rowInfo.row[threesHeader] > -1 ? mediumRed :
                                            rowInfo.row[threesHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Rebounds',
            accessor: rebHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[rebHeader] > 1 ? brightGreen :
                            rowInfo.row[rebHeader] > .5 ? mediumGreen :
                                rowInfo.row[rebHeader] >= .25 ? lightGreen :
                                    rowInfo.row[rebHeader] < 0 && rowInfo.row[rebHeader] > -0.25 ? lightRed :
                                        rowInfo.row[rebHeader] < -0.25 && rowInfo.row[rebHeader] > -1 ? mediumRed :
                                            rowInfo.row[rebHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Assists',
            accessor: astHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[astHeader] > 1 ? brightGreen :
                            rowInfo.row[astHeader] > .5 ? mediumGreen :
                                rowInfo.row[astHeader] >= .25 ? lightGreen :
                                    rowInfo.row[astHeader] < 0 && rowInfo.row[astHeader] > -0.25 ? lightRed :
                                        rowInfo.row[astHeader] < -0.25 && rowInfo.row[astHeader] > -1 ? mediumRed :
                                            rowInfo.row[astHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Steals',
            accessor: stlHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[stlHeader] > 1 ? brightGreen :
                            rowInfo.row[stlHeader] > .5 ? mediumGreen :
                                rowInfo.row[stlHeader] >= .25 ? lightGreen :
                                    rowInfo.row[stlHeader] < 0 && rowInfo.row[stlHeader] > -0.25 ? lightRed :
                                        rowInfo.row[stlHeader] < -0.25 && rowInfo.row[stlHeader] > -1 ? mediumRed :
                                            rowInfo.row[stlHeader] <= -1 ? brightRed : null,
                    },
                };
            },
        }, {
            Header: 'Blocks',
            accessor: blkHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[blkHeader] > 1 ? brightGreen :
                            rowInfo.row[blkHeader] > .5 ? mediumGreen :
                                rowInfo.row[blkHeader] >= .25 ? lightGreen :
                                    rowInfo.row[blkHeader] < 0 && rowInfo.row[blkHeader] > -0.25 ? lightRed :
                                        rowInfo.row[blkHeader] < -0.25 && rowInfo.row[blkHeader] > -1 ? mediumRed :
                                            rowInfo.row[blkHeader] <= -1 ? brightRed : null,
                    }
                };
            }
        }, {
            Header: 'FG%',
            accessor: fgHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[fgHeader] > 1 ? brightGreen :
                            rowInfo.row[fgHeader] > .5 ? mediumGreen :
                                rowInfo.row[fgHeader] >= .25 ? lightGreen :
                                    rowInfo.row[fgHeader] < 0 && rowInfo.row[fgHeader] > -0.25 ? lightRed :
                                        rowInfo.row[fgHeader] < -0.25 && rowInfo.row[fgHeader] > -1 ? mediumRed :
                                            rowInfo.row[fgHeader] <= -1 ? brightRed : null,
                    }
                };
            }
        }, {
            Header: 'FT%',
            accessor: ftHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[ftHeader] > 1 ? brightGreen :
                            rowInfo.row[ftHeader] > .5 ? mediumGreen :
                                rowInfo.row[ftHeader] >= .25 ? lightGreen :
                                    rowInfo.row[ftHeader] < 0 && rowInfo.row[ftHeader] > -0.25 ? lightRed :
                                        rowInfo.row[ftHeader] < -0.25 && rowInfo.row[ftHeader] > -1 ? mediumRed :
                                            rowInfo.row[ftHeader] <= -1 ? brightRed : null,
                    }
                };
            }
        }, {
            Header: 'Turnovers',
            accessor: toHeader,
            className: "center",
            getProps: (state, rowInfo, column) => {
                return {
                    style: {
                        backgroundColor: rowInfo && rowInfo.row[toHeader] > 1 ? brightGreen :
                            rowInfo.row[toHeader] > .5 ? mediumGreen :
                                rowInfo.row[toHeader] >= .25 ? lightGreen :
                                    rowInfo.row[toHeader] < 0 && rowInfo.row[toHeader] > -0.25 ? lightRed :
                                        rowInfo.row[toHeader] < -0.25 && rowInfo.row[toHeader] > -1 ? mediumRed :
                                            rowInfo.row[toHeader] <= -1 ? brightRed : null,
                    }
                };
            }
        }];

        const expandedColumnNames = [{
            headerClassName: 'hide',
            width: 35,
            className: "center"
        }, {
            headerClassName: 'hide',
            className: "center"
        }, {
            headerClassName: 'hide',
            className: "center"
        }, {
            headerClassName: 'hide',
            width: 200,
            className: "center",
            Cell: row => (
                <div>Stats per game</div>
            )
        }, {
            headerClassName: 'hide',
            accessor: 'pts',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'fG3M',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'reb',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'ast',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'stl',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'blk',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'fgPct',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'ftPct',
            className: "center"
        }, {
            headerClassName: 'hide',
            accessor: 'tov',
            className: "center"
        }]

        return (
            <div>
                <div className="flex-vertical flex-one">
                    <p>Trade Analysis</p>
                </div>
                <h3>Your Team</h3>
                <ReactTable
                    data={this.state.teamTradeStatsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}

                />

                <h3>Their Team</h3>
                <ReactTable
                    data={this.state.oppTeamTradeStatsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}

                />

                <h3>Improvement</h3>
                <ReactTable
                    data={this.state.teamTradeImprovement}
                    columns={columnNamesAvg}
                    showPagination={false}
                    minRows={0}

                />

                <h3></h3>

                <ReactTable
                    key="teamTable"
                    data={this.state.teamStatsSeason}
                    columns={columnNames}
                    showPagination={false}
                    minRows={0}
                    defaultSortDesc={true}
                    defaultSorted={[{
                        id: 'overallRank',
                        desc: false
                    }]}
                    // SubComponent={row => {
                    //     return (
                    //         <ReactTable
                    //             data={[row.original]}
                    //             columns={expandedColumnNames}
                    //             showPagination={false}
                    //             defaultPageSize={1}
                    //             className="expandedRow"
                    //         />
                    //     );
                    // }}
                    getTrProps={(state, rowInfo) => {
                        if (rowInfo && rowInfo.row) {
                            return {
                                onClick: (e) => {
                                    if (this.state.selected.indexOf(rowInfo.original._id) >= 0) {
                                        var selected = this.state.selected;
                                        selected.splice(selected.indexOf(rowInfo.original._id), 1);
                                        this.setState({ selected: selected });
                                        this.removeFromTeamTrade(rowInfo);
                                    } else {
                                        var selected = this.state.selected;
                                        selected.push(rowInfo.original._id);
                                        this.setState({ selected: selected });
                                        this.addToTeamTrade(rowInfo);
                                    }

                                },
                                style: {
                                    background: this.state.selected.indexOf(rowInfo.original._id) >= 0 ? '#00afec' : 'white',
                                    color: this.state.selected.indexOf(rowInfo.original._id) >= 0 ? 'white' : 'black'
                                }
                            }
                        } else {
                            return {}
                        }
                    }}

                />
                <div className="team-avg-table">
                    <ReactTable
                        data={this.state.teamStatsSeasonAvg}
                        columns={columnNamesAvg}
                        showPagination={false}
                        minRows={0}
                    />
                </div>

                <div className={`table-group ${this.state.showCompareTable ? 'compare-table-group' : ''}`}>

                    <h3 className="team-table-header compare-header">Trade with team</h3>
                    <div className="flex">
                        <div className="team-select">
                            <Select
                                value={teamSelected}
                                onChange={this.handleTeamChange}
                                options={teamSelect}
                            />
                        </div>
                        <div className={`hide-button team-select ${this.state.showCompareTable ? '' : 'hide'}`} onClick={this.hideCompareTable}>
                            Hide Comparison
                    </div>
                    </div>
                    <div className={`team-table ${this.state.showCompareTable ? '' : 'hide'}`}>
                        <div className="team-table">
                            <ReactTable
                                key="compareTable"
                                data={this.state.compareStatsSeason}
                                columns={columnNames}
                                showPagination={false}
                                minRows={0}
                                defaultSortDesc={true}
                                defaultSorted={[{
                                    id: 'overallRank',
                                    desc: false
                                }]}
                                // SubComponent={row => {
                                //     return (
                                //         <ReactTable
                                //             data={[row.original]}
                                //             columns={expandedColumnNames}
                                //             showPagination={false}
                                //             defaultPageSize={1}
                                //             className="expandedRow"
                                //         />
                                //     );
                                // }}
                                getTrProps={(state, rowInfo) => {
                                    if (rowInfo && rowInfo.row) {
                                        return {
                                            onClick: (e) => {
                                                if (this.state.selectedOpp.indexOf(rowInfo.original._id) >= 0) {
                                                    var selectedOpp = this.state.selectedOpp;
                                                    selectedOpp.splice(selectedOpp.indexOf(rowInfo.original._id), 1);
                                                    this.setState({ selectedOpp: selectedOpp });
                                                    this.removeFromOppTeamTrade(rowInfo);
                                                } else {
                                                    var selectedOpp = this.state.selected;
                                                    selectedOpp.push(rowInfo.original._id);
                                                    this.setState({ selectedOpp: selectedOpp });
                                                    this.addToOppTeamTrade(rowInfo);
                                                }

                                            },
                                            style: {
                                                background: this.state.selectedOpp.indexOf(rowInfo.original._id) >= 0 ? '#00afec' : 'white',
                                                color: this.state.selectedOpp.indexOf(rowInfo.original._id) >= 0 ? 'white' : 'black'
                                            }
                                        }
                                    } else {
                                        return {}
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default TradeAnalysis;