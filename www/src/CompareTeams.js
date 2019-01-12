import React, { Component } from 'react';
import ReactTable from 'react-table';
import Select from 'react-select';
import 'react-table/react-table.css';
import stringSimilarity from 'string-similarity';

export class CompareTeams extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teamSelected: [],
            compareStatsSeason: [],
            compareStatsRecent: [],
            compareStatsSeasonAvg: [],
            compareStatsRecentAvg: [],
            showCompareTable: false

        }
        this.hideCompareTable = this.hideCompareTable.bind(this);
    }

    handleTeamChange = (teamSelected) => {
        this.setState({ teamSelected });
        this.callApi('/api/teams/' + this.props.leagueId + '/' + teamSelected.value)
            .then(results => {
                this.setState({showCompareTable: true});
                this.buildTeam(results)
            })
            .catch(err => console.log(err));
    }

    hideCompareTable() {
        this.setState({showCompareTable: false})
    }

    componentDidMount() {}

    callApi = async (url) => {
        const response = await fetch(url);
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    };

    buildTeam(team) {
        var teamStatsSeason = [];
        var teamStatsRecent = [];
        var teamStatsSeasonAvg = [];
        var teamStatsRecentAvg = [];
        var teamPlayers = team;
        var playerRankingsSeason = this.props.playerRankingsSeason;
        var playerRankingsRecent = this.props.playerRankingsRecent;

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
                        fgRating: (teamStatsSeasonAvg.fgRating) ? (teamStatsSeasonAvg.fgRating + playerRankingsSeason[j].fgRating) : playerRankingsSeason[j].fgRating,
                        ftRating: (teamStatsSeasonAvg.ftRating) ? (teamStatsSeasonAvg.ftRating + playerRankingsSeason[j].ftRating) : playerRankingsSeason[j].ftRating,
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
                        fgRating: (teamStatsRecentAvg.fgRating) ? (teamStatsRecentAvg.fgRating + playerRankingsRecent[j].fgRating) : playerRankingsRecent[j].fgRating,
                        ftRating: (teamStatsRecentAvg.ftRating) ? (teamStatsRecentAvg.ftRating + playerRankingsRecent[j].ftRating) : playerRankingsRecent[j].ftRating,
                        toRating: (teamStatsRecentAvg.toRating) ? (teamStatsRecentAvg.toRating + playerRankingsRecent[j].toRating) : playerRankingsRecent[j].toRating
                    }
                    break
                }
            }
        }

        this.setState({ compareStatsSeason: teamStatsSeason });
        this.setState({ compareStatsRecent: teamStatsRecent });

        teamStatsSeasonAvg = {
            ptsRating: Number(teamStatsSeasonAvg.ptsRating / teamStatsSeason.length).toFixed(2),
            threeRating: Number(teamStatsSeasonAvg.threeRating / teamStatsSeason.length).toFixed(2),
            astRating: Number(teamStatsSeasonAvg.astRating / teamStatsSeason.length).toFixed(2),
            rebRating: Number(teamStatsSeasonAvg.rebRating / teamStatsSeason.length).toFixed(2),
            stlRating: Number(teamStatsSeasonAvg.stlRating / teamStatsSeason.length).toFixed(2),
            blkRating: Number(teamStatsSeasonAvg.blkRating / teamStatsSeason.length).toFixed(2),
            fgRating: Number(teamStatsSeasonAvg.fgRating / teamStatsSeason.length).toFixed(2),
            ftRating: Number(teamStatsSeasonAvg.fgRating / teamStatsSeason.length).toFixed(2),
            toRating: Number(teamStatsSeasonAvg.ftRating / teamStatsSeason.length).toFixed(2)
        }


        teamStatsRecentAvg = {
            ptsRating: Number(teamStatsRecentAvg.ptsRating / teamStatsRecent.length).toFixed(2),
            threeRating: Number(teamStatsRecentAvg.threeRating / teamStatsRecent.length).toFixed(2),
            astRating: Number(teamStatsRecentAvg.astRating / teamStatsRecent.length).toFixed(2),
            rebRating: Number(teamStatsRecentAvg.rebRating / teamStatsRecent.length).toFixed(2),
            stlRating: Number(teamStatsRecentAvg.stlRating / teamStatsRecent.length).toFixed(2),
            blkRating: Number(teamStatsRecentAvg.blkRating / teamStatsRecent.length).toFixed(2),
            fgRating: Number(teamStatsRecentAvg.fgRating / teamStatsRecent.length).toFixed(2),
            ftRating: Number(teamStatsRecentAvg.fgRating / teamStatsRecent.length).toFixed(2),
            toRating: Number(teamStatsRecentAvg.ftRating / teamStatsRecent.length).toFixed(2)
        }

        //Put the [] around the arrays so the table below can know its a single row
        this.setState({ compareStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ compareStatsRecentAvg: [teamStatsRecentAvg] });
    }

    render() {
        const { teamSelected } = this.state;
        const teamSelect = [];

        for (var i = 0; i < this.props.teams.length; i++) {
            teamSelect.push({ value: this.props.teams[i].team_id, label: this.props.teams[i].name })
        }

        return (
            <div className={`table-group ${this.state.showCompareTable ? 'compare-table-group' : ''}`}>
                
                <h3 className="team-table-header compare-header">Compare to other team</h3>
                <div className="flex">
                    <div className="team-select">
                        <Select
                            value={teamSelected}
                            onChange={this.handleTeamChange}
                            options={teamSelect}
                        />
                    </div>
                    <div className={`hide-button team-select ${this.state.showCompareTable ? '' : 'hide'}`} onClick = {this.hideCompareTable}>
                        Hide Comparison
                    </div>
                </div>
                <div className={`team-table ${this.state.showCompareTable ? '' : 'hide'}`}>
                    {/*<h4 className="team-avg-header center">Avg Season Rankings</h4>*/}
                    <div className="team-avg-table">
                      <ReactTable
                        data={this.state.compareStatsSeasonAvg}
                        columns={this.props.columnNamesAvg}
                        showPagination={false}
                        minRows={0}
                      />
                    </div>
                    <div className="team-table">
                      <ReactTable
                        data={this.state.compareStatsSeason}
                        columns={this.props.columnNames}
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
            </div>
        )
    }
}