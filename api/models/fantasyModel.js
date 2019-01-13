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
    },
    pV: {
        type: Number
    },
    rV: {
        type: Number
    },
    aV: {
        type: Number
    },
    sV: {
        type: Number
    },
    bV: {
        type: Number
    },
    'fg%V': {
        type: Number
    },
    'ft%V': {
        type: Number
    },
    toV: {
        type: Number
    },
    '3V': {
        type: Number
    }
});

var RankingsRecentSchema = new Schema({
    fullName: {
        type: String
    },
    rank: {
        type: Number
    },
    value: {
        type: Number
    },
    pV: {
        type: Number
    },
    rV: {
        type: Number
    },
    aV: {
        type: Number
    },
    sV: {
        type: Number
    },
    bV: {
        type: Number
    },
    'fg%V': {
        type: Number
    },
    'ft%V': {
        type: Number
    },
    toV: {
        type: Number
    },
    '3V': {
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

var PickupTargetsRecentSchema = new Schema({
    leagueId: {
        type: String
    },
    players: {
        type: Array
    }
});

var PlayerSeasonDataSchema = new Schema({
    playerId: Number,
    playerName: String,
    teamId: Number,
    teamAbbreviation: String,
    min: Number,
    fgPct: Number,
    ftPct: Number,
    fG3M: Number,
    reb: Number,
    ast: Number,
    tov: Number,
    stl: Number,
    blk: Number,
    pts: Number,
    fta: Number,
    fga: Number,
    fgPctRank: Number,
    ftPctRank: Number,
    fg3mRank: Number,
    rebRank: Number,
    astRank: Number,
    tovRank: Number,
    stlRank: Number,
    blkRank: Number,
    ptsRank: Number,
    ftaRank: Number,
    fgaRank: Number,
    ftRating: Number,
    fgRating: Number,
    ptsRating: Number,
    threeRating: Number,
    rebRating: Number,
    astRating: Number,
    stlRating: Number,
    blkRating: Number,
    toRating: Number,
    ftaRating: Number,
    fgaRating: Number,
    ftMixedRating: Number,
    fgMixedRating: Number,
    overallRating: Number,
    overallRank: Number
})

var PlayerRecentDataSchema = new Schema({
    playerId: Number,
    playerName: String,
    teamId: Number,
    teamAbbreviation: String,
    min: Number,
    fgPct: Number,
    ftPct: Number,
    fG3M: Number,
    reb: Number,
    ast: Number,
    tov: Number,
    stl: Number,
    blk: Number,
    pts: Number,
    fta: Number,
    fga: Number,
    fgPctRank: Number,
    ftPctRank: Number,
    fg3mRank: Number,
    rebRank: Number,
    astRank: Number,
    tovRank: Number,
    stlRank: Number,
    blkRank: Number,
    ptsRank: Number,
    ftaRank: Number,
    fgaRank: Number,
    ftRating: Number,
    fgRating: Number,
    ptsRating: Number,
    threeRating: Number,
    rebRating: Number,
    astRating: Number,
    stlRating: Number,
    blkRating: Number,
    toRating: Number,
    ftaRating: Number,
    fgaRating: Number,
    ftMixedRating: Number,
    fgMixedRating: Number,
    overallRating: Number,
    overallRank: Number
})

module.exports = mongoose.model('Players', PlayersSchema);
module.exports = mongoose.model('Teams', TeamsSchema);
module.exports = mongoose.model('RankingsSeason', RankingsSeasonSchema);
module.exports = mongoose.model('RankingsRecent', RankingsRecentSchema);
module.exports = mongoose.model('PickupTargetsSeason', PickupTargetsSeasonSchema);
module.exports = mongoose.model('PickupTargetsRecent', PickupTargetsRecentSchema);
module.exports = mongoose.model('PlayerSeasonData', PlayerSeasonDataSchema);
module.exports = mongoose.model('PlayerRecentData', PlayerRecentDataSchema);