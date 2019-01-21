import React, { Component } from 'react';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import { CompareTeams } from './CompareTeams';
import Cookies from 'js-cookie';

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
            updateCompareTable: false
        }
    }

    componentDidMount() {
        var leagueId = Cookies.get('leagueId');
        var teamId = Cookies.get('teamId');
        var seasonStats = JSON.parse(localStorage.getItem('teamStatsSeason'));
        var recentStats = JSON.parse(localStorage.getItem('teamStatsRecent'));
        var seasonAvg = JSON.parse(localStorage.getItem('teamStatsSeasonAvg'));
        var recentAvg = JSON.parse(localStorage.getItem('teamStatsRecentAvg'));


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
                teams: JSON.parse(localStorage.getItem('teams'))
            });
        }
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

        var compareTeamsHTML = "";
        if (this.state.leagueId) {
            compareTeamsHTML = <CompareTeams leagueId={this.state.leagueId} teams={this.state.teams} columnNames={columnNames}
                playerRankingsSeason={this.state.playerRankingsSeason} playerRankingsRecent={this.state.playerRankingsRecent}
                columnNamesAvg={columnNamesAvg} updateCompareTable={this.state.updateCompareTable} expandedColumnNames={expandedColumnNames} 
                title="Team to trade with" />

        }

        return (
            <div>
                <div className="flex-vertical flex-one">
                    <p>Trade Analysis</p>
                </div>
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
                    SubComponent={row => {
                        return (
                            <ReactTable
                                data={[row.original]}
                                columns={expandedColumnNames}
                                showPagination={false}
                                defaultPageSize={1}
                                className="expandedRow"
                            />
                        );
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

                {compareTeamsHTML}

            </div>
        )
    }
}

export default TradeAnalysis;