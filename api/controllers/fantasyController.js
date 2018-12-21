'use strict';

var fantasy = require('../../data/fantasy');


var mongoose = require('mongoose'),
    Players = mongoose.model('Players'),
    Teams = mongoose.model('Teams'),
    RankingsSeason = mongoose.model('RankingsSeason'),
    RankingsTwoWeeks = mongoose.model('RankingsTwoWeeks'),
    PickupTargetsSeason = mongoose.model('PickupTargetsSeason'),
    PickupTargetsTwoWeeks = mongoose.model('PickupTargetsTwoWeeks');

exports.list_all_players = function(req, res) {
    Players.find({ leagueId: req.params.leagueId }, function(err, players) {
        if (err)
            res.send(err);
        res.json(players);
    });
};

exports.list_season_pickups = function(req, res) {
    PickupTargetsSeason.find({ leagueId: req.params.leagueId }, function(err, players) {
        if (err)
            res.send(err);
        res.json(players);
    });
};

exports.list_two_week_pickups = function(req, res) {
    PickupTargetsTwoWeeks.find({ leagueId: req.params.leagueId }, function(err, players) {
        if (err)
            res.send(err);
        res.json(players);
    });
};

exports.list_teams = function(req, res) {
    Teams.find({ leagueId: req.params.leagueId }, function(err, teams) {
        if (err)
            res.send(err);
        res.json(teams);
    });
};

exports.list_teams_players = function(req, res) {
    var teamKey = req.params.leagueId + '.t.' + req.params.teamKey;
    Players.find({ leagueId: req.params.leagueId }, function(err, players) {
        if (err)
            res.send(err);

        players = players[0].players;

        var teamPlayers = [];
        for (var i = 0; i < players.length; i++) {
            if (players[i].team_key === teamKey) {
                teamPlayers.push(players[i])
            }
        }
        res.json(teamPlayers);
    });
};

exports.list_season_rankings = function(req, res) {
    RankingsSeason.find({}, function(err, players) {
        if (err)
            res.send(err);
        res.json(players);
    });
};

exports.list_two_week_rankings = function(req, res) {
    RankingsTwoWeeks.find({}, function(err, players) {
        if (err)
            res.send(err);
        res.json(players);
    });
};

exports.erase_current_data = function(req, res) {
    RankingsSeason.remove({}, function(err, task) {
        if (err)
            res.send(err);
        // res.json({ message: 'All teams successfully deleted' });
    });
    RankingsTwoWeeks.remove({}, function(err, task) {
        if (err)
            res.send(err);
        // res.json({ message: 'All teams successfully deleted' });
    });
    Teams.remove({}, function(err, task) {
        if (err)
            res.send(err);
        // res.json({ message: 'All teams successfully deleted' });
    });
    PickupTargetsSeason.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });

    PickupTargetsTwoWeeks.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });
    Teams.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });
    Players.remove({}, function(err, task) {
        if (err)
            res.send(err);
        res.json({ message: 'All players successfully deleted' });
    });
};

exports.get_rankings = function(req, res) {
    RankingsSeason.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });
    RankingsTwoWeeks.remove({}, function(err, task) {
        if (err)
            res.send(err);
    });

    fantasy.getRankings();
    res.json("Rankings Completed");
}