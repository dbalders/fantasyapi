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
            compareStatsTwoWeeks: [],
            compareStatsSeasonAvg: [],
            compareStatsTwoWeeksAvg: [],
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
        var teamStatsTwoWeeks = [];
        var teamStatsSeasonAvg = [];
        var teamStatsTwoWeeksAvg = [];
        var teamPlayers = team;
        var playerRankingsSeason = this.props.playerRankingsSeason;
        var playerRankingsTwoWeeks = this.props.playerRankingsTwoWeeks;

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

        this.setState({ compareStatsSeason: teamStatsSeason });
        this.setState({ compareStatsTwoWeeks: teamStatsTwoWeeks });

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
        this.setState({ compareStatsSeasonAvg: [teamStatsSeasonAvg] });
        this.setState({ compareStatsTwoWeeksAvg: [teamStatsTwoWeeksAvg] });
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
                            id: 'rank',
                            desc: false
                        }]}
                      />
                    </div>
                </div>
            </div>
        )
    }
}