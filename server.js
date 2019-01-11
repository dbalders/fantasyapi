var path = require('path');
var qs = require('querystring');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var mongoose = require('mongoose');
var async = require("async");
var Players = require('./api/models/fantasyModel');
var fantasy = require('./data/fantasy');

var clientId = process.env.APP_CLIENT_ID || require('./conf.js').APP_CLIENT_ID;
var clientSecret = process.env.APP_CLIENT_SECRET || require('./conf.js').APP_CLIENT_SECRET;
var redirectUri = process.env.APP_REDIRECT_URI || require('./conf.js').APP_CLIENT_URL;

//setup the express app
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); //should this be true?
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
})); //Not sure what this is
app.use(express.static(path.join(__dirname, 'public')));

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/fantasydb'); 

var routes = require('./api/routes/fantasyRoutes'); //importing route
routes(app); //register the route

//load the home page data
app.get('/', function(req, res) {
    var teamData;
    var playerData;
    var playerRankings;
    var pickupTargets;
    var playerRankingsTwoWeeks;
    var pickupTargetsTwoWeeks;
    var todayDate;
    var twoWeeksDate;

    //get the data from the session that is returned from yahoo
    if (req.session.pickupTargets)
        pickupTargets = req.session.pickupTargets;

    if (req.session.pickupTargetsTwoWeeks)
        pickupTargetsTwoWeeks = req.session.pickupTargetsTwoWeeks;

    if (req.session.teamData)
        teamData = JSON.stringify(req.session.teamData, null, 2);

    if (req.session.playerData)
        playerData = JSON.stringify(req.session.playerData);

    if (req.session.playerRankings)
        playerRankings = JSON.stringify(req.session.playerRankings);

    if (req.session.playerRankingsTwoWeeks)
        playerRankingsTwoWeeks = JSON.stringify(req.session.playerRankingsTwoWeeks);

    if (req.session.todayDate)
        todayDate = req.session.todayDate;

    if (req.session.twoWeeksDate)
        twoWeeksDate = req.session.twoWeeksDate;
    
    //render the home page
    res.render('home', {
        title: 'Fantasy Pickups',
        user: req.session.token,
        teamData: teamData,
        playerData: playerData,
        playerRankings: playerRankings,
        pickupTargets: pickupTargets,
        playerRankingsTwoWeeks: playerRankingsTwoWeeks,
        pickupTargetsTwoWeeks: pickupTargetsTwoWeeks,
        todayDate: todayDate,
        twoWeeksDate: twoWeeksDate
    });
});

app.get('/logout', function(req, res) {
    delete req.session.token;
    res.clearCookie("leagueId");
    res.clearCookie("teamId");
    res.clearCookie("fantasyPlatform");
    res.clearCookie("yahooAccessToken");
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

    //Load in all the data
    fantasy.getYahooData(req, res, options);
});

app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});