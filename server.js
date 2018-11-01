/**
 * Create conf.js like below
 *
 * module.exports = {
 *   'APP_CLIENT_ID': 'CLIENT_ID_GIVEN_BY_YAHOO',
 *   'APP_CLIENT_SECRET': 'CLIENT_SECRET_GIVEN_BY_YAHOO'
 * }
 */

var path = require('path');
var qs = require('querystring');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var YahooFantasy = require('yahoo-fantasy');
var async = require("async");

var clientId = process.env.APP_CLIENT_ID || require('./conf.js').APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET || require('./conf.js').APP_CLIENT_SECRET;
var redirectUri = process.env.APP_REDIRECT_URI || 'http://myapp.com/auth/yahoo/callback';

var yf = new YahooFantasy(clientId, clientSecret);

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 80);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
    var teamData;
    var playerData;

    if (req.session.teamData)
        teamData = JSON.stringify(req.session.teamData, null, 2);

    if (req.session.playerData)
        playerData = JSON.stringify(req.session.playerData);

    res.render('home', {
        title: 'Home',
        user: req.session.token,
        teamData: teamData,
        playerData: playerData
    });
});

app.get('/logout', function(req, res) {
    delete req.session.token;
    res.redirect('/');
});

app.get('/auth/yahoo', function(req, res) {
    var authorizationUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
    var queryParams = qs.stringify({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code'
    });

    res.redirect(authorizationUrl + '?' + queryParams);
});

app.get('/auth/yahoo/callback', function(req, res) {
    var accessTokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
    var options = {
        url: accessTokenUrl,
        headers: { Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64') },
        rejectUnauthorized: false,
        json: true,
        form: {
            code: req.query.code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        }
    };

    request.post(options, function(err, response, body) {
        if (err)
            console.log(err);
        else {
            var teams = [];
            var players = [];
            var playersDone = false;
            var accessToken = body.access_token;
            var currentYear = (new Date()).getFullYear();
            var leagueId;

            req.session.token = accessToken;

            yf.setUserToken(accessToken);

            //This currently only works for one league, expand later to multiple leagues
            async.series([
                function(callback) {
                    console.log('in first')
                    yf.games.user({seasons: currentYear, game_codes: 'nba'}, function cb(err, data) {
                        var leagueId = data[0].game_key;

                        yf.user.game_leagues(leagueId, function cb(err, data) {
                            leagueId = data.games[0].leagues[0][0].league_key
                            callback(null, 1)
                        })
                    })
                },
                function(callback) {
                    console.log('in second')
                    yf.league.teams('385.l.40083',
                      function cb(err, data) {
                        if (err)
                          console.log(err);
                        else
                            async.forEachOf(data.teams, function (value, teamKey, callback) {
                                var currentTeam = {
                                    'team_key': data.teams[teamKey].team_key,
                                    'team_id': Number(data.teams[teamKey].team_id),
                                    'name': data.teams[teamKey].name
                                }
                                teams.push(currentTeam);

                                callback();
                            }, function (err) {
                                if (err) console.error(err.message);

                                async.forEachOf(teams, function (value, key, callback) {
                                    yf.team.roster(teams[key].team_key,
                                      function cb(err, playersData) {
                                        var teamKey = teams[key].team_key;
                                        if (err)
                                          console.log(err);
                                        else
                                            async.forEachOf(playersData.roster, function (value, playerKey, callback) {
                                                playerObject = {
                                                    'team_key': teamKey,
                                                    'player_key':playersData.roster[playerKey].player_key,
                                                    'player_id': playersData.roster[playerKey].player_id,
                                                    'first': playersData.roster[playerKey].name.first,
                                                    'last': playersData.roster[playerKey].name.last,
                                                    'full': playersData.roster[playerKey].name.full
                                                };
                                                players.push(playerObject);
                                                callback();
                                            }, function(err) {
                                                if (err) console.error(err.message);
                                                callback();
                                            })
                                        // callback(null, 2);
                                        }
                                    )
                                }, function (err) {
                                    if (err) console.error(err.message);

                                    req.session.teamData = teams;
                                    req.session.playerData = players; 
                                    return res.redirect('/');
                                });
                            });
                        }
                    )
                    callback(null, 2);
                }
            ]);

            //This currently only works for one league, expand later to multiple leagues
            // yf.games.user({seasons: currentYear, game_codes: 'nba'}, function cb(err, data) {
            //     var leagueId = data[0].game_key;

            //     yf.user.game_leagues(leagueId, function cb(err, data) {
            //         leagueId = data.games[0].leagues[0][0].league_key
            //     })
            // })

            //need to make this not manual somehow. Make a list and have them choose? idk
            // yf.league.teams('385.l.40083',
            //   function cb(err, data) {
            //     if (err)
            //       console.log(err);
            //     else
            //         async.forEachOf(data.teams, function (value, teamKey, callback) {
            //             var currentTeam = {
            //                 'team_key': data.teams[teamKey].team_key,
            //                 'team_id': Number(data.teams[teamKey].team_id),
            //                 'name': data.teams[teamKey].name
            //             }
            //             teams.push(currentTeam);

            //             callback();
            //         }, function (err) {
            //             if (err) console.error(err.message);

            //             async.forEachOf(teams, function (value, key, callback) {
            //                 yf.team.roster(teams[key].team_key,
            //                   function cb(err, playersData) {
            //                     var teamKey = teams[key].team_key;
            //                     if (err)
            //                       console.log(err);
            //                     else
            //                         async.forEachOf(playersData.roster, function (value, playerKey, callback) {
            //                             playerObject = {
            //                                 'team_key': teamKey,
            //                                 'player_key':playersData.roster[playerKey].player_key,
            //                                 'player_id': playersData.roster[playerKey].player_id,
            //                                 'first': playersData.roster[playerKey].name.first,
            //                                 'last': playersData.roster[playerKey].name.last,
            //                                 'full': playersData.roster[playerKey].name.full
            //                             };
            //                             players.push(playerObject);
            //                             callback();
            //                         }, function(err) {
            //                             if (err) console.error(err.message);
            //                             callback();
            //                         })
            //                   }
            //                 )
            //             }, function (err) {
            //                 if (err) console.error(err.message);

            //                 req.session.teamData = teams;
            //                 req.session.playerData = players; 
            //                 return res.redirect('/');
            //             });
            //         });
            //   }
            // )          
        }
    });
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});