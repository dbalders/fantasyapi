'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PlayersSchema = new Schema({
    leagueId: {
        type: Number
    },
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    fullName: {
        type: String
    },
    rank: {
        type: Number
    }
});

var PlayersSchema = new Schema({
    leagueId: {
        type: String
    },
    players: {
        type: Array
    }
});

var TeamsSchema = new Schema({
    leagueId: {
        type: String
    },
    teams: {
        type: Array
    }
});

var RankingsSeasonSchema = new Schema({
    fullName: {
        type: String
    },
    rank: {
        type: Number
    },
    value: {
        type: Number
    }
});

var RankingsTwoWeeksSchema = new Schema({
    fullName: {
        type: String
    },
    rank: {
        type: Number
    },
    value: {
        type: Number
    }
});

var PickupTargetsSeasonSchema = new Schema({
    leagueId: {
        type: String
    },
    players: {
        type: Array
    }
});

var PickupTargetsTwoWeeksSchema = new Schema({
    leagueId: {
        type: String
    },
    players: {
        type: Array
    }
});

module.exports = mongoose.model('Players', PlayersSchema);
module.exports = mongoose.model('Teams', TeamsSchema);
module.exports = mongoose.model('RankingsSeason', RankingsSeasonSchema);
module.exports = mongoose.model('RankingsTwoWeeks', RankingsTwoWeeksSchema);
module.exports = mongoose.model('PickupTargetsSeason', PickupTargetsSeasonSchema);
module.exports = mongoose.model('PickupTargetsTwoWeeks', PickupTargetsTwoWeeksSchema);