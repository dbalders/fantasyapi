var request = require("request"),
    YahooFantasy = require('yahoo-fantasy'),
    async = require("async"),
    scraper = require('table-scraper'),
    stringSimilarity = require('string-similarity');

var mongoose = require('mongoose'),
    Players = mongoose.model('Players'),
    Teams = mongoose.model('Teams'),
    RankingsSeason = mongoose.model('RankingsSeason'),
    RankingsTwoWeeks = mongoose.model('RankingsTwoWeeks'),
    PickupTargetsSeason = mongoose.model('PickupTargetsSeason'),
    PickupTargetsTwoWeeks = mongoose.model('PickupTargetsTwoWeeks');

var clientId = process.env.APP_CLIENT_ID || require('../conf.js').APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET || require('../conf.js').APP_CLIENT_SECRET;
var redirectUri = process.env.APP_REDIRECT_URI || require('../conf.js').APP_CLIENT_URL;

var yf = new YahooFantasy(clientId, clientSecret);

exports.getYahooData = function (req, res, options) {

    request.post(options, function (err, response, body) {
        if (err)
            console.log(err);
        else {

            var teams = [];
            var players = [];
            var playerNames = [];
            var playersDone = false;
            var accessToken = body.access_token;
            var leagueId;

            //Get either current year or last year for when season rolls into the new year
            var currentYear = (new Date());
            if (currentYear.getMonth() > 6) {
                currentYear = currentYear.getFullYear();
            } else {
                currentYear = currentYear.getFullYear() - 1;
            }

            req.session.token = accessToken;

            yf.setUserToken(accessToken);

            //get the current nba league that the user is in
            //This currently only works for one league, expand later to multiple leagues
            async.series([
                function (callback) {
                    if (err)
                        console.log(err);
                    else
                        //first get the nba leagues user is in 
                        //First call only provides yahoo overall league ID
                        yf.games.user({ seasons: currentYear, game_codes: 'nba' }, function cb(err, data) {
                            leagueId = data[0].game_key;

                            console.log(leagueId);

                            //Now that we have overall ID, get user specific league ID
                            yf.user.game_leagues(leagueId, function cb(err, data) {
                                leagueId = data.games[0].leagues[0][0].league_key;
                                res.cookie('leagueId', leagueId);
                                callback(null, 1);
                            })
                        })
                },
                function (callback) {
                    console.log(leagueId)
                    //Use the league ID to get a list of all the teams and their players
                    yf.league.teams(leagueId,
                        function cb(err, data) {
                            if (err)
                                console.log(err);
                            else
                                //For each team, grab their team key, id, and name and store it
                                async.forEachOf(data.teams, function (value, teamKey, callback) {
                                    var currentTeam = {
                                        'team_key': data.teams[teamKey].team_key,
                                        'team_id': Number(data.teams[teamKey].team_id),
                                        'name': data.teams[teamKey].name
                                    }
                                    teams.push(currentTeam);

                                    if (data.teams[teamKey].is_owned_by_current_login !== undefined) {
                                        res.cookie('teamId', data.teams[teamKey].team_id)
                                    }


                                    callback();
                                }, function (err) {
                                    if (err) console.error(err.message);

                                    Teams.findOneAndUpdate({
                                        leagueId: leagueId
                                    }, {
                                            leagueId: leagueId,
                                            teams: teams
                                        }, {
                                            upsert: true
                                        },
                                        function (err, doc) {
                                            // if (err) return 
                                            if (doc !== null) {
                                                doc.teams = teams;
                                            }
                                        });

                                    //With now having each team key, go through each to get their full roster
                                    async.forEachOf(teams, function (value, key, callback) {
                                        yf.team.roster(teams[key].team_key,
                                            function cb(err, playersData) {
                                                var teamKey = teams[key].team_key;
                                                if (err)
                                                    console.log(err);
                                                else
                                                    var teamPlayers = [];
                                                //After having their roster, store each player into a single player array
                                                async.forEachOf(playersData.roster, function (value, playerKey, callback) {
                                                    playerObject = {
                                                        'team_key': teamKey,
                                                        'player_key': playersData.roster[playerKey].player_key,
                                                        'player_id': playersData.roster[playerKey].player_id,
                                                        'first': playersData.roster[playerKey].name.first,
                                                        'last': playersData.roster[playerKey].name.last,
                                                        'full': playersData.roster[playerKey].name.full
                                                    };
                                                    players.push(playerObject);
                                                    teamPlayers.push(playerObject);
                                                    //push also to specific player name for string similarity later
                                                    playerNames.push(playersData.roster[playerKey].name.full);
                                                    callback();
                                                }, function (err) {
                                                    if (err) console.error(err.message);
                                                    console.log('team' + teamKey)
                                                    callback();
                                                })
                                            }
                                        )
                                    }, function (err) {
                                        if (err) console.error(err.message);
                                        //Put all the players into the database
                                        Players.findOneAndUpdate({
                                            leagueId: leagueId
                                        }, {
                                                leagueId: leagueId,
                                                players: players
                                            }, {
                                                upsert: true
                                            },
                                            function (err, doc) {
                                                // if (err) return 
                                                if (doc !== null) {
                                                    doc.players = players;
                                                }
                                            });

                                        getPickups(leagueId, playerNames);
                                        res.redirect('/');
                                        return
                                    });
                                });
                        }
                    )
                    callback(null, 2);
                }
            ]);
        }
    });

}

exports.getRankings = function () {
    var playerRankings = [];
    var playerRankingsTwoWeeks = [];

    //Get rankings for season
    scraper.get('https://basketballmonster.com/playerrankings.aspx')
        .then(function (tableData) {
            tableData = tableData[0];
            async.forEachOf(tableData, function (value, i, callback) {

                RankingsSeason.create({
                    'rank': tableData[i].Rank_16,
                    'value': tableData[i].Value_16,
                    'fullName': tableData[i].Name_16,
                    'pV': tableData[i].pV_16,
                    '3V': tableData[i]['3/g_16'],
                    'rV': tableData[i].rV_16,
                    'aV': tableData[i].aV_16,
                    'sV': tableData[i].sV_16,
                    'bV': tableData[i].bV_16,
                    'fg%V': tableData[i]['fg%V_16'],
                    'ft%V': tableData[i]['ft%V_16'],
                    'toV': tableData[i].toV_16
                });

                callback();
            }, function (err) {
                //Finding rankings for last 2 weeks
                var todayFullDate = new Date();
                var todayDate = ("0" + (todayFullDate.getMonth() + 1)).slice(-2);
                var twoWeeksFullDate = new Date(+new Date - 12096e5)
                var twoWeeksDate = ("0" + (twoWeeksFullDate.getMonth() + 1)).slice(-2);
                todayDate = todayDate + ("0" + todayFullDate.getDate()).slice(-2);
                todayDate = todayDate + todayFullDate.getUTCFullYear();
                twoWeeksDate = twoWeeksDate + ("0" + twoWeeksFullDate.getDate()).slice(-2);;
                twoWeeksDate = twoWeeksDate + twoWeeksFullDate.getUTCFullYear();

                scraper.get('https://basketballmonster.com/playerrankings.aspx?start=' + twoWeeksDate + '&end=' + todayDate)
                    .then(function (tableData) {
                        tableData = tableData[0];
                        async.forEachOf(tableData, function (value, i, callback) {

                            RankingsTwoWeeks.create({
                                'rank': tableData[i].Rank_16,
                                'value': tableData[i].Value_16,
                                'fullName': tableData[i].Name_16,
                                'pV': tableData[i].pV_16,
                                '3V': tableData[i]['3/g_16'],
                                'rV': tableData[i].rV_16,
                                'aV': tableData[i].aV_16,
                                'sV': tableData[i].sV_16,
                                'bV': tableData[i].bV_16,
                                'fg%V': tableData[i]['fg%V_16'],
                                'ft%V': tableData[i]['ft%V_16'],
                                'toV': tableData[i].toV_16
                            });

                            callback();
                        }, function (err) {
                            return
                        })
                    });
            })
        });
}

function getPickups(leagueId, playerNames) {
    var rankingsSeason = [];
    var rankingsTwoWeeks = [];

    RankingsSeason.find({}, function (err, players) {
        if (err)
            res.send(err);
        var pickupTargets = [];
        async.forEachOf(players, function (value, i, callback) {

            var similarPlayer = stringSimilarity.findBestMatch(players[i].fullName, playerNames);
            var similarPlayerRating = similarPlayer.bestMatch.rating;

            if (similarPlayerRating < 0.7) {
                pickupTargets.push(players[i]);
            } else {
                // console.log(players[i])
            }

            callback();
        }, function (err) {
            if (err)
                res.send(err);

            PickupTargetsSeason.findOneAndUpdate({
                leagueId: leagueId
            }, {
                    leagueId: leagueId,
                    players: pickupTargets
                }, {
                    upsert: true
                },
                function (err, doc) {
                    if (err)
                        res.send(err);

                    if (doc !== null) {
                        doc.players = pickupTargets;
                    }
                });
            return
        })
    });

    RankingsTwoWeeks.find({}, function (err, players) {
        if (err)
            res.send(err);
        var pickupTargets = [];
        async.forEachOf(players, function (value, i, callback) {

            var similarPlayer = stringSimilarity.findBestMatch(players[i].fullName, playerNames);
            var similarPlayerRating = similarPlayer.bestMatch.rating;

            if (similarPlayerRating < 0.7) {
                pickupTargets.push(players[i]);
            }

            callback();
        }, function (err) {
            if (err)
                res.send(err);

            PickupTargetsTwoWeeks.findOneAndUpdate({
                leagueId: leagueId
            }, {
                    leagueId: leagueId,
                    players: pickupTargets
                }, {
                    upsert: true
                },
                function (err, doc) {
                    if (err)
                        res.send(err);

                    if (doc !== null) {
                        doc.players = pickupTargets;
                    }
                });
            return
        })
    });
}

exports.getEspnData = function (espnId, res) {
    console.log(espnId)
    var url = 'http://fantasy.espn.com/apis/v3/games/fba/seasons/2019/segments/0/leagues/' + espnId + '?view=mRoster&view=mTeam';
    var teams = [];
    var players = [];
    var playerNames = [];

    request({
        url: url,
        json: true
    }, function (error, response, body) {
        if (error)
            res.send(error)

        if (body.messages !== undefined) {
            res.status(500)
            res.send(body)
            res.end();
            return;
        }

        var teamData = body.teams;
        var teamPlayersArray = [];

        //Loop through the 10 teams to get each team name and players
        for (var i = 0; i < teamData.length; i++) {
            var teamName = teamData[i].location + " " + teamData[i].nickname;
            var teamPlayers = teamData[i].roster.entries;
            var teamId = teamData[i].id;
            //Loop through the players to add to an array
            for (var j = 0; j < teamPlayers.length; j++) {
                console.log(teamPlayers[j].playerPoolEntry.player)
                playerObject = {
                    //Adding in the .t. to the teamkey to keep it consistant with yahoo's format
                    'team_key': espnId + '.t.' + teamId,
                    'player_id': teamPlayers[j].playerPoolEntry.id,
                    'first': teamPlayers[j].playerPoolEntry.player.firstName,
                    'last': teamPlayers[j].playerPoolEntry.player.lastName,
                    'full': teamPlayers[j].playerPoolEntry.player.fullName
                };
                players.push(playerObject);
                playerNames.push(teamPlayers[j].playerPoolEntry.player.fullName);
            }

            //Push the team name and the players to an array
            teams.push({
                name: teamName,
                team_id: teamId,
                league_id: espnId
            });
        }

        //Submit all the teams to mongo
        Teams.findOneAndUpdate({
            leagueId: espnId
        }, {
                leagueId: espnId,
                teams: teams
            }, {
                upsert: true
            },
            function (err, doc) {
                // if (err) return 
                if (doc !== null) {
                    doc.teams = teams;
                }
            });

        //Submit all players to mongo
        Players.findOneAndUpdate({
            leagueId: espnId
        }, {
                leagueId: espnId,
                players: players
            }, {
                upsert: true
            },
            function (err, doc) {
                // if (err) return 
                if (doc !== null) {
                    doc.players = players;
                }
            });

        getPickups(espnId, playerNames)

        //Send the data back
        res.json(teams);
    });
}