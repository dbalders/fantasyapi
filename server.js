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
        // teamData = JSON.stringify(req.session.teamData, null, 2);
        playerData = JSON.stringify(req.session.playerData);
        console.log(playerData)

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
            // TODO : Handle this refreshToken!
            //var refreshToken = body.refresh_token;

            req.session.token = accessToken;

            yf.setUserToken(accessToken);

            yf.league.teams('385.l.40083',
              function cb(err, data) {
                if (err)
                  console.log(err);
                else
                    async.forEachOf(data.teams, function (value, key, callback) {
                        var currentTeam = {
                            'team_key': data.teams[key].team_key,
                            'team_id': Number(data.teams[key].team_id),
                            'name': data.teams[key].name
                        }

                        teams.push(currentTeam);

                        callback();
                    }, function (err) {
                        if (err) console.error(err.message);
                        // configs is now a map of JSON data
                        // doSomethingWith(configs);
                        console.log(teams);
                        console.log('fully done')
                    });
                    // for (i = 0; i < data.teams.length; i++) {
                    //     var currentTeam = {
                    //         'team_key': data.teams[i].team_key,
                    //         'team_id': Number(data.teams[i].team_id),
                    //         'name': data.teams[i].name
                    //     }

                    //     teams.push(currentTeam);
                    // }

                    


                    // for (j = 0; j < teams.length; j++) {
                    //     var teamKey = teams[j].team_key;
                    //     // while (playersDone === false) {
                    //         console.log('in while');
                    //         yf.team.roster(teams[j].team_key,
                    //           function cb(err, playersData) {
                    //             console.log('in playerData');
                    //             if (err)
                    //               console.log(err);
                    //             else
                    //                 for (k = 0; k < playersData.roster.length; k++) {
                    //                     playerObject = {
                    //                         'team_key': teamKey,
                    //                         'player_key':playersData.roster[k].player_key,
                    //                         'player_id': playersData.roster[k].player_id,
                    //                         'first': playersData.roster[k].name.first,
                    //                         'last': playersData.roster[k].name.last,
                    //                         'full': playersData.roster[k].name.full
                    //                     };
                    //                     players.push(playerObject);
                    //                     console.log('k' + k);
                    //                     console.log(playersData.roster.length)
                    //                     if (k === (playersData.roster.length - 1)) {
                    //                         console.log('players done is true')
                    //                         playersDone = true;
                    //                     }
                    //                     console.log(playersDone);
                    //                 }
                    //                 req.session.playerData = players;

                    //           }
                    //         )
                    //     // }

                        
                    //     console.log('j' + j)
                    // }

                    // console.log(players);

                    // playerData = players;
                console.log('returning')
                console.log(teams)
                console.log(players);
                return res.redirect('/');
              }
            )

            req.session.teamData = teams;
            console.log(req.session.teamData);
            req.session.playerData = players;

            console.log('is done');

            var allPlayers = false;
            var playerCount = 25;
            var playerList = 0;         
        }
    });
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});