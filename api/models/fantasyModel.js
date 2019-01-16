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

var BBMRankingsSeasonSchema = new Schema({
    playerName: {
        type: String
    },
    overallRank: {
        type: Number
    },
    overallRating: {
        type: Number
    },
    ptsRating: {
        type: Number
    },
    rebRating: {
        type: Number
    },
    astRating: {
        type: Number
    },
    stlRating: {
        type: Number
    },
    blkRating: {
        type: Number
    },
    fgMixedRating: {
        type: Number
    },
    ftMixedRating: {
        type: Number
    },
    toRating: {
        type: Number
    },
    threeRating: {
        type: Number
    }
});

var BBMRankingsRecentSchema = new Schema({
    playerName: {
        type: String
    },
    overallRank: {
        type: Number
    },
    overallRating: {
        type: Number
    },
    ptsRating: {
        type: Number
    },
    rebRating: {
        type: Number
    },
    astRating: {
        type: Number
    },
    stlRating: {
        type: Number
    },
    blkRating: {
        type: Number
    },
    fgMixedRating: {
        type: Number
    },
    ftMixedRating: {
        type: Number
    },
    toRating: {
        type: Number
    },
    threeRating: {
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

var BBMPickupTargetsSeasonSchema = new Schema({
    leagueId: {
        type: String
    },
    players: {
        type: Array
    }
});

var BBMPickupTargetsRecentSchema = new Schema({
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
module.exports = mongoose.model('BBMRankingsSeason', BBMRankingsSeasonSchema);
module.exports = mongoose.model('BBMRankingsRecent', BBMRankingsRecentSchema);
module.exports = mongoose.model('PickupTargetsSeason', PickupTargetsSeasonSchema);
module.exports = mongoose.model('PickupTargetsRecent', PickupTargetsRecentSchema);
module.exports = mongoose.model('BBMPickupTargetsSeason', BBMPickupTargetsSeasonSchema);
module.exports = mongoose.model('BBMPickupTargetsRecent', BBMPickupTargetsRecentSchema);
module.exports = mongoose.model('PlayerSeasonData', PlayerSeasonDataSchema);
module.exports = mongoose.model('PlayerRecentData', PlayerRecentDataSchema);