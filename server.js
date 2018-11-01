var path = require('path');
var qs = require('querystring');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var YahooFantasy = require('yahoo-fantasy');
var async = require("async");
var scraper = require('table-scraper');

var clientId = process.env.APP_CLIENT_ID || require('./conf.js').APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET || require('./conf.js').APP_CLIENT_SECRET;
var redirectUri = process.env.APP_REDIRECT_URI || 'http://myapp.com/auth/yahoo/callback';

var yf = new YahooFantasy(clientId, clientSecret);

//setup the express app
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

//load the home page data
app.get('/', function(req, res) {
    var teamData;
    var playerData;
    var playerRankings;

    //get the data from the session that is returned from yahoo
    if (req.session.teamData)
        teamData = JSON.stringify(req.session.teamData, null, 2);

    if (req.session.playerData)
        playerData = JSON.stringify(req.session.playerData);

    if (req.session.playerRankings)
        playerRankings = JSON.stringify(req.session.playerRankings);

    //render the home page
    res.render('home', {
        title: 'Home',
        user: req.session.token,
        teamData: teamData,
        playerData: playerData,
        playerRankings: playerRankings
    });
});

app.get('/logout', function(req, res) {
    delete req.session.token;
    res.redirect('/');
});

//go to yahoo auth and get back the client data
app.get('/auth/yahoo', function(req, res) {
    var authorizationUrl = 'https://api.login.yahoo.com/oauth2/request_auth';
    var queryParams = qs.stringify({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code'
    });

    res.redirect(authorizationUrl + '?' + queryParams);
});

//this is the callback from yahoo. grab the headers and query all the data
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
            var playerRankings = [];

            req.session.token = accessToken;

            yf.setUserToken(accessToken);

            //get the current nba league that the user is in
            //This currently only works for one league, expand later to multiple leagues
            async.series([
                function(callback) {
                    if (err)
                          console.log(err);
                    else
                    //first get the nba leagues user is in 
                    //First call only provides yahoo overall league ID
                    yf.games.user({seasons: currentYear, game_codes: 'nba'}, function cb(err, data) {
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

                                //With now having each team key, go through each to get their full roster
                                async.forEachOf(teams, function (value, key, callback) {
                                    yf.team.roster(teams[key].team_key,
                                      function cb(err, playersData) {
                                        var teamKey = teams[key].team_key;
                                        if (err)
                                          console.log(err);
                                        else
                                            //After having their roster, store each player into a single player array
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
                                        }
                                    )
                                }, function (err) {
                                    if (err) console.error(err.message);
                                    //scrape the site and store the data from the table
                                    scraper.get('https://basketballmonster.com/playerrankings.aspx')
                                        .then(function(tableData) {
                                            tableData = tableData[0];
                                            async.forEachOf(tableData, function (value, i, callback) {

                                                //Push the important aspects from each row into a new array
                                                //Each object has `_16` because BBM has headers every round (16 rounds shown)
                                                playerRankings.push([{
                                                    'rank': tableData[i].Rank_16,
                                                    'value': tableData[i].Value_16,
                                                    'name': tableData[i].Name_16
                                                }])
                                                callback();
                                            }, function (err) {
                                                //Set the session variables and reload the home page
                                                req.session.teamData = teams;
                                                req.session.playerData = players; 
                                                req.session.playerRankings = playerRankings;
                                                console.log(req.session.playerRankings)
                                                return res.redirect('/');

                                            })
                                        });
                                });
                            });
                        }
                    )
                    callback(null, 2);
                }
            ]);
        }
    });
});

//Get the rankings from BBM for players
app.get('/rankings', function(req, res) {
    var playerRankings = [];

    //scrape the site and store the data from the table
    scraper.get('https://basketballmonster.com/playerrankings.aspx')
        .then(function(tableData) {
            tableData = tableData[0];
            async.forEachOf(tableData, function (value, i, callback) {

                //Push the important aspects from each row into a new array
                //Each object has `_16` because BBM has headers every round (16 rounds shown)
                playerRankings.push([{
                    'rank': tableData[i].Rank_16,
                    'value': tableData[i].Value_16,
                    'name': tableData[i].Name_16
                }])
            })
            
            //Stringify the results and render the page with the data
            playerRankings = JSON.stringify(playerRankings);

            console.log(req.session.teamData);

            res.render('rankings', {
                title: 'Rankings',
                playerRankings
            });
        });
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});