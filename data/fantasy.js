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

exports.getYahooData = function(req, res, options) {

    request.post(options, function(err, response, body) {
        if (err)
            console.log(err);
        else {

            var teams = [];
            var players = [];
            var playerNames = [];
            var playersDone = false;
            var accessToken = body.access_token;
            var currentYear = (new Date()).getFullYear();
            var leagueId;

            req.session.token = accessToken;

            yf.setUserToken(accessToken);
            res.redirect('/');

            //get the current nba league that the user is in
            //This currently only works for one league, expand later to multiple leagues
            async.series([
                function(callback) {
                    if (err)
                        console.log(err);
                    else
                        //first get the nba leagues user is in 
                        //First call only provides yahoo overall league ID
                        yf.games.user({ seasons: currentYear, game_codes: 'nba' }, function cb(err, data) {
                            leagueId = data[0].game_key;

                            //Now that we have overall ID, get user specific league ID
                            yf.user.game_leagues(leagueId, function cb(err, data) {
                                leagueId = data.games[0].leagues[0][0].league_key
                                callback(null, 1)
                            })
                        })
                },
                function(callback) {
                    //Use the league ID to get a list of all the teams and their players
                    yf.league.teams(leagueId,
                        function cb(err, data) {
                            if (err)
                                console.log(err);
                            else
                                //For each team, grab their team key, id, and name and store it
                                async.forEachOf(data.teams, function(value, teamKey, callback) {
                                    var currentTeam = {
                                        'team_key': data.teams[teamKey].team_key,
                                        'team_id': Number(data.teams[teamKey].team_id),
                                        'name': data.teams[teamKey].name
                                    }
                                    teams.push(currentTeam);

                                    callback();
                                }, function(err) {
                                    if (err) console.error(err.message);

                                    Teams.create({
                                        leagueId: leagueId,
                                        teams: teams
                                    });

                                    //With now having each team key, go through each to get their full roster
                                    async.forEachOf(teams, function(value, key, callback) {
                                        yf.team.roster(teams[key].team_key,
                                            function cb(err, playersData) {
                                                var teamKey = teams[key].team_key;
                                                if (err)
                                                    console.log(err);
                                                else
                                                    //After having their roster, store each player into a single player array
                                                    async.forEachOf(playersData.roster, function(value, playerKey, callback) {
                                                        playerObject = {
                                                            'team_key': teamKey,
                                                            'player_key': playersData.roster[playerKey].player_key,
                                                            'player_id': playersData.roster[playerKey].player_id,
                                                            'first': playersData.roster[playerKey].name.first,
                                                            'last': playersData.roster[playerKey].name.last,
                                                            'full': playersData.roster[playerKey].name.full
                                                        };
                                                        players.push(playerObject);
                                                        //push also to specific player name for string similarity later
                                                        playerNames.push(playersData.roster[playerKey].name.full);
                                                        callback();
                                                    }, function(err) {
                                                        if (err) console.error(err.message);
                                                        callback();
                                                    })
                                            }
                                        )
                                    }, function(err) {
                                        if (err) console.error(err.message);
                                        //Put all the players into the database
                                        Players.create({
                                            leagueId: leagueId,
                                            players: players
                                        });
                                        getPickups(leagueId, playerNames);
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

exports.getRankings = function() {
    var playerRankings = [];
    var playerRankingsTwoWeeks = [];

    //Get rankings for season
    scraper.get('https://basketballmonster.com/playerrankings.aspx')
        .then(function(tableData) {
            tableData = tableData[0];
            async.forEachOf(tableData, function(value, i, callback) {

                RankingsSeason.create({
                    'rank': tableData[i].Rank_16,
                    'value': tableData[i].Value_16,
                    'fullName': tableData[i].Name_16
                });

                callback();
            }, function(err) {
                //Finding rankings for last 2 weeks
                var todayFullDate = new Date();
                var todayDate = ("0" + (todayFullDate.getMonth() + 1)).slice(-2);
                var twoWeeksFullDate = new Date(+new Date - 12096e5)
                var twoWeeksDate = ("0" + (twoWeeksFullDate.getMonth() + 1)).slice(-2);
                todayDate = todayDate + ("0" + todayFullDate.getDate()).slice(-2);
                todayDate = todayDate + twoWeeksFullDate.getUTCFullYear();
                twoWeeksDate = twoWeeksDate + ("0" + twoWeeksFullDate.getDate()).slice(-2);;
                twoWeeksDate = twoWeeksDate + twoWeeksFullDate.getUTCFullYear();

                scraper.get('https://basketballmonster.com/playerrankings.aspx?start=' + twoWeeksDate + '&end=' + todayDate)
                    .then(function(tableData) {
                        tableData = tableData[0];
                        async.forEachOf(tableData, function(value, i, callback) {

                            RankingsTwoWeeks.create({
                                'rank': tableData[i].Rank_16,
                                'value': tableData[i].Value_16,
                                'fullName': tableData[i].Name_16
                            });

                            callback();
                        }, function(err) {
                            return
                        })
                    });
            })
        });
}

function getPickups(leagueId, playerNames) {
    var pickupTargets = [];
    var rankingsSeason = [];
    var rankingsTwoWeeks = [];

    PickupTargetsSeason.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });

    PickupTargetsTwoWeeks.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });

    RankingsSeason.find({}, function(err, players) {
        if (err)
            res.send(err);
        async.forEachOf(players, function(value, i, callback) {

            var similarPlayer = stringSimilarity.findBestMatch(players[i].fullName, playerNames);
            var similarPlayerRating = similarPlayer.bestMatch.rating;

            if (similarPlayerRating < 0.7) {
                pickupTargets.push(players[i]);
            }

            callback();
        }, function(err) {
            PickupTargetsSeason.create({
            	leagueId: leagueId,
            	players: pickupTargets
            })
        	return
        })
    });

    RankingsTwoWeeks.find({}, function(err, players) {
        if (err)
            res.send(err);
        async.forEachOf(players, function(value, i, callback) {

            var similarPlayer = stringSimilarity.findBestMatch(players[i].fullName, playerNames);
            var similarPlayerRating = similarPlayer.bestMatch.rating;

            if (similarPlayerRating < 0.7) {
                pickupTargets.push(players[i]);
            }

            callback();
        }, function(err) {
            PickupTargetsTwoWeeks.create({
            	leagueId: leagueId,
            	players: pickupTargets
            })
        	return
        })
    });



    // for (i = 0; i < rankingsSeason.length; i++) {
    //     var similarPlayer = stringSimilarity.findBestMatch(rankingsSeason[i].fullName, playerNames);
    //     var similarPlayerRating = similarPlayer.bestMatch.rating;

    //     if (similarPlayerRating < 0.7) {
    //         RankingsTwoWeeks.create({
    //             'leagueId': leagueId,
    //             'value': tableData[i].Value_16,
    //             'fullName': tableData[i].Name_16
    //         });
    //     }
    // }

    // for (i = 0; i < rankingsTwoWeeks.length; i++) {
    //     var similarPlayer = stringSimilarity.findBestMatch(rankingsTwoWeeks[i].fullName, playerNames);
    //     var similarPlayerRating = similarPlayer.bestMatch.rating;

    //     if (similarPlayerRating < 0.7) {
    //         pickupTargetsSeason.push(rankedPlayer);
    //     }
    // }
}