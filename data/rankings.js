var request = require("request"),
    async = require("async"),
    nba = require("nba"),
    stats = require("stats-lite");

var mongoose = require('mongoose'),
    PlayerSeasonData = mongoose.model('PlayerSeasonData'),
    PlayerRecentData = mongoose.model('PlayerRecentData')

exports.getRankings = function (req, res) {
    var playerRankings = [];
    var playerRankingsRecent = [];
    var nbaSeasonPlayers = [];
    var nbaRecentPlayers = [];

    var ftSeasonArray = [];
    var fgSeasonArray = [];
    var threeSeasonArray = [];
    var ptsSeasonArray = [];
    var rebSeasonArray = [];
    var astSeasonArray = [];
    var stlSeasonArray = [];
    var blkSeasonArray = [];
    var toSeasonArray = [];
    var ftSeasonStDev;
    var fgSeasonStDev;
    var threeSeasonStDev;
    var ptsSeasonStDev;
    var rebSeasonStDev;
    var astSeasonStDev;
    var stlSeasonStDev;
    var blkSeasonStDev;
    var toSeasonStDev;
    var ftSeasonAvg;
    var fgSeasonAvg;
    var threeSeasonAvg;
    var ptsSeasonAvg;
    var rebSeasonAvg;
    var astSeasonAvg;
    var stlSeasonAvg;
    var blkSeasonAvg;
    var toSeasonAvg;

    var ftRecentArray = [];
    var fgRecentArray = [];
    var threeRecentArray = [];
    var ptsRecentArray = [];
    var rebRecentArray = [];
    var astRecentArray = [];
    var stlRecentArray = [];
    var blkRecentArray = [];
    var toRecentArray = [];
    var ftRecentStDev;
    var fgRecentStDev;
    var threeRecentStDev;
    var ptsRecentStDev;
    var rebRecentStDev;
    var astRecentStDev;
    var stlRecentStDev;
    var blkRecentStDev;
    var toRecentStDev;
    var ftRecentAvg;
    var fgRecentAvg;
    var threeRecentAvg;
    var ptsRecentAvg;
    var rebRecentAvg;
    var astRecentAvg;
    var stlRecentAvg;
    var blkRecentAvg;
    var toRecentAvg;

    PlayerSeasonData.remove({}, function (err, task) {
        if (err)
            res.send(err);
    });
    PlayerRecentData.remove({}, function (err, task) {
        if (err)
            res.send(err);
    });

    nba.stats.playerStats({ leagueID: "00" }).then(function (data) {

        nbaSeasonPlayers.push(data.leagueDashPlayerStats);
        nbaSeasonPlayers = nbaSeasonPlayers[0];

        async.forEachOf(nbaSeasonPlayers, function (value, i, callback) {
            if (nbaSeasonPlayers[i].nbaFantasyPtsRank < 175) {
                ftSeasonArray.push(nbaSeasonPlayers[i].ftPct);
                fgSeasonArray.push(nbaSeasonPlayers[i].fgPct);
                threeSeasonArray.push(nbaSeasonPlayers[i].fG3M);
                ptsSeasonArray.push(nbaSeasonPlayers[i].pts);
                rebSeasonArray.push(nbaSeasonPlayers[i].reb);
                astSeasonArray.push(nbaSeasonPlayers[i].ast);
                stlSeasonArray.push(nbaSeasonPlayers[i].stl);
                blkSeasonArray.push(nbaSeasonPlayers[i].blk);
                toSeasonArray.push(nbaSeasonPlayers[i].tov);
            }

            callback();
        }, function (err) {
            ftSeasonStDev = (stats.stdev(ftSeasonArray).toFixed(2) / 2);
            fgSeasonStDev = (stats.stdev(fgSeasonArray).toFixed(2));
            threeSeasonStDev = stats.stdev(threeSeasonArray).toFixed(2);
            ptsSeasonStDev = stats.stdev(ptsSeasonArray).toFixed(2);
            rebSeasonStDev = stats.stdev(rebSeasonArray).toFixed(2);
            astSeasonStDev = stats.stdev(astSeasonArray).toFixed(2);
            stlSeasonStDev = stats.stdev(stlSeasonArray).toFixed(2);
            blkSeasonStDev = stats.stdev(blkSeasonArray).toFixed(2);
            toSeasonStDev = stats.stdev(toSeasonArray).toFixed(2);

            ftSeasonAvg = stats.mean(ftSeasonArray).toFixed(2);
            fgSeasonAvg = stats.mean(fgSeasonArray).toFixed(2);
            threeSeasonAvg = stats.mean(threeSeasonArray).toFixed(2);
            ptsSeasonAvg = stats.mean(ptsSeasonArray).toFixed(2);
            rebSeasonAvg = stats.mean(rebSeasonArray).toFixed(2);
            astSeasonAvg = stats.mean(astSeasonArray).toFixed(2);
            stlSeasonAvg = stats.mean(stlSeasonArray).toFixed(2);
            blkSeasonAvg = stats.mean(blkSeasonArray).toFixed(2);
            toSeasonAvg = stats.mean(toSeasonArray).toFixed(2);

            for (var i = 0; i < nbaSeasonPlayers.length; i++) {
                var ftRating = Number((nbaSeasonPlayers[i].ftPct - ftSeasonAvg) / ftSeasonStDev).toFixed(2);
                var fgRating = Number((nbaSeasonPlayers[i].fgPct - fgSeasonAvg) / fgSeasonStDev).toFixed(2);
                var threeRating = Number((nbaSeasonPlayers[i].fG3M - threeSeasonAvg) / threeSeasonStDev).toFixed(2);
                var rebRating = Number((nbaSeasonPlayers[i].reb - rebSeasonAvg) / rebSeasonStDev).toFixed(2);
                var astRating = Number((nbaSeasonPlayers[i].ast - astSeasonAvg) / astSeasonStDev).toFixed(2);
                var ptsRating = Number((nbaSeasonPlayers[i].pts - ptsSeasonAvg) / ptsSeasonStDev).toFixed(2);
                var stlRating = Number((nbaSeasonPlayers[i].stl - stlSeasonAvg) / stlSeasonStDev).toFixed(2);
                var blkRating = Number((nbaSeasonPlayers[i].blk - blkSeasonAvg) / blkSeasonStDev).toFixed(2);
                var toRating = Number(0 - (nbaSeasonPlayers[i].tov - toSeasonAvg) / toSeasonStDev).toFixed(2);

                var overallRating = ((+ftRating + +fgRating + +threeRating + +rebRating + +astRating + +ptsRating + +stlRating + +blkRating + +toRating) / 9).toFixed(2);

                nbaSeasonPlayers[i].fgRating = fgRating;
                nbaSeasonPlayers[i].threeRating = threeRating;
                nbaSeasonPlayers[i].rebRating = rebRating;
                nbaSeasonPlayers[i].astRating = astRating;
                nbaSeasonPlayers[i].ptsRating = ptsRating;
                nbaSeasonPlayers[i].stlRating = stlRating;
                nbaSeasonPlayers[i].blkRating = blkRating;
                nbaSeasonPlayers[i].toRating = toRating;
                nbaSeasonPlayers[i].ftRating = ftRating;
                nbaSeasonPlayers[i].overallRating = overallRating;
            }
        })

    }).then(function (data) {
        nba.stats.playerStats({ leagueID: "00", LastNGames: "7" }).then(function (data) {

            nbaRecentPlayers.push(data.leagueDashPlayerStats)
            nbaRecentPlayers = nbaRecentPlayers[0]

            async.forEachOf(nbaRecentPlayers, function (value, i, callback) {
                if (nbaRecentPlayers[i].nbaFantasyPtsRank < 175) {
                    ftRecentArray.push(nbaRecentPlayers[i].ftPct);
                    fgRecentArray.push(nbaRecentPlayers[i].fgPct);
                    threeRecentArray.push(nbaRecentPlayers[i].fG3M);
                    ptsRecentArray.push(nbaRecentPlayers[i].pts);
                    rebRecentArray.push(nbaRecentPlayers[i].reb);
                    astRecentArray.push(nbaRecentPlayers[i].ast);
                    stlRecentArray.push(nbaRecentPlayers[i].stl);
                    blkRecentArray.push(nbaRecentPlayers[i].blk);
                    toRecentArray.push(nbaRecentPlayers[i].tov);
                }
                callback();
            }, function (err) {
                ftRecentStDev = (stats.stdev(ftRecentArray).toFixed(2) / 2);
                fgRecentStDev = (stats.stdev(fgRecentArray).toFixed(2));
                threeRecentStDev = stats.stdev(threeRecentArray).toFixed(2);
                ptsRecentStDev = stats.stdev(ptsRecentArray).toFixed(2);
                rebRecentStDev = stats.stdev(rebRecentArray).toFixed(2);
                astRecentStDev = stats.stdev(astRecentArray).toFixed(2);
                stlRecentStDev = stats.stdev(stlRecentArray).toFixed(2);
                blkRecentStDev = stats.stdev(blkRecentArray).toFixed(2);
                toRecentStDev = stats.stdev(toRecentArray).toFixed(2);

                ftRecentAvg = stats.mean(ftRecentArray).toFixed(2);
                fgRecentAvg = stats.mean(fgRecentArray).toFixed(2);
                threeRecentAvg = stats.mean(threeRecentArray).toFixed(2);
                ptsRecentAvg = stats.mean(ptsRecentArray).toFixed(2);
                rebRecentAvg = stats.mean(rebRecentArray).toFixed(2);
                astRecentAvg = stats.mean(astRecentArray).toFixed(2);
                stlRecentAvg = stats.mean(stlRecentArray).toFixed(2);
                blkRecentAvg = stats.mean(blkRecentArray).toFixed(2);
                toRecentAvg = stats.mean(toRecentArray).toFixed(2);

                for (var i = 0; i < nbaRecentPlayers.length; i++) {
                    var ftRating = Number((nbaRecentPlayers[i].ftPct - ftSeasonAvg) / ftSeasonStDev).toFixed(2);
                    var fgRating = Number((nbaRecentPlayers[i].fgPct - fgSeasonAvg) / fgSeasonStDev).toFixed(2);
                    var threeRating = Number((nbaRecentPlayers[i].fG3M - threeSeasonAvg) / threeSeasonStDev).toFixed(2);
                    var rebRating = Number((nbaRecentPlayers[i].reb - rebSeasonAvg) / rebSeasonStDev).toFixed(2);
                    var astRating = Number((nbaRecentPlayers[i].ast - astSeasonAvg) / astSeasonStDev).toFixed(2);
                    var ptsRating = Number((nbaRecentPlayers[i].pts - ptsSeasonAvg) / ptsSeasonStDev).toFixed(2);
                    var stlRating = Number((nbaRecentPlayers[i].stl - stlSeasonAvg) / stlSeasonStDev).toFixed(2);
                    var blkRating = Number((nbaRecentPlayers[i].blk - blkSeasonAvg) / blkSeasonStDev).toFixed(2);
                    var toRating = Number(0 - (nbaRecentPlayers[i].tov - toSeasonAvg) / toSeasonStDev).toFixed(2);

                    var overallRating = ((+ftRating + +fgRating + +threeRating + +rebRating + +astRating + +ptsRating + +stlRating + +blkRating + +toRating) / 9).toFixed(2);

                    nbaRecentPlayers[i].fgRating = fgRating;
                    nbaRecentPlayers[i].threeRating = threeRating;
                    nbaRecentPlayers[i].rebRating = rebRating;
                    nbaRecentPlayers[i].astRating = astRating;
                    nbaRecentPlayers[i].ptsRating = ptsRating;
                    nbaRecentPlayers[i].stlRating = stlRating;
                    nbaRecentPlayers[i].blkRating = blkRating;
                    nbaRecentPlayers[i].toRating = toRating;
                    nbaRecentPlayers[i].ftRating = ftRating;
                    nbaRecentPlayers[i].overallRating = overallRating;
                }
            })
        }).then(function (data) {
            async.parallel({
                one: function (callback) {

                    playerRank = 1;

                    nbaSeasonPlayers.sort((a, b) => Number(b.overallRating) - Number(a.overallRating));

                    for (var i = 0; i < nbaSeasonPlayers.length; i++) {
                        if (nbaSeasonPlayers[i].gpRank < 350) {
                            PlayerSeasonData.create({
                                playerId: nbaSeasonPlayers[i].playerId,
                                playerName: nbaSeasonPlayers[i].playerName,
                                teamId: nbaSeasonPlayers[i].teamId,
                                teamAbbreviation: nbaSeasonPlayers[i].teamAbbreviation,
                                min: nbaSeasonPlayers[i].min,
                                fgPct: nbaSeasonPlayers[i].fgPct,
                                ftPct: nbaSeasonPlayers[i].ftPct,
                                fG3M: nbaSeasonPlayers[i].fG3M,
                                reb: nbaSeasonPlayers[i].reb,
                                ast: nbaSeasonPlayers[i].ast,
                                tov: nbaSeasonPlayers[i].tov,
                                stl: nbaSeasonPlayers[i].stl,
                                blk: nbaSeasonPlayers[i].blk,
                                pts: nbaSeasonPlayers[i].pts,
                                fgPctRank: nbaSeasonPlayers[i].fgPctRank,
                                ftPctRank: nbaSeasonPlayers[i].ftPctRank,
                                fg3mRank: nbaSeasonPlayers[i].fg3mRank,
                                rebRank: nbaSeasonPlayers[i].rebRank,
                                astRank: nbaSeasonPlayers[i].astRank,
                                tovRank: nbaSeasonPlayers[i].tovRank,
                                stlRank: nbaSeasonPlayers[i].stlRank,
                                blkRank: nbaSeasonPlayers[i].blkRank,
                                ptsRank: nbaSeasonPlayers[i].ptsRank,
                                ftRating: nbaSeasonPlayers[i].ftRating,
                                fgRating: nbaSeasonPlayers[i].fgRating,
                                ptsRating: nbaSeasonPlayers[i].ptsRating,
                                threeRating: nbaSeasonPlayers[i].threeRating,
                                rebRating: nbaSeasonPlayers[i].rebRating,
                                astRating: nbaSeasonPlayers[i].astRating,
                                stlRating: nbaSeasonPlayers[i].stlRating,
                                blkRating: nbaSeasonPlayers[i].blkRating,
                                toRating: nbaSeasonPlayers[i].toRating,
                                overallRating: nbaSeasonPlayers[i].overallRating,
                                overallRank: playerRank
                            });
                            playerRank++
                        }
                    }
                    callback()
                },
                two: function (callback) {
                    nbaRecentPlayers.sort((a, b) => Number(b.overallRating) - Number(a.overallRating));

                    playerRank = 1;

                    for (var i = 0; i < nbaRecentPlayers.length; i++) {
                        if (nbaRecentPlayers[i].gpRank < 350) {
                            PlayerRecentData.create({
                                playerId: nbaRecentPlayers[i].playerId,
                                playerName: nbaRecentPlayers[i].playerName,
                                teamId: nbaRecentPlayers[i].teamId,
                                teamAbbreviation: nbaRecentPlayers[i].teamAbbreviation,
                                min: nbaRecentPlayers[i].min,
                                fgPct: nbaRecentPlayers[i].fgPct,
                                ftPct: nbaRecentPlayers[i].ftPct,
                                fG3M: nbaRecentPlayers[i].fG3M,
                                reb: nbaRecentPlayers[i].reb,
                                ast: nbaRecentPlayers[i].ast,
                                tov: nbaRecentPlayers[i].tov,
                                stl: nbaRecentPlayers[i].stl,
                                blk: nbaRecentPlayers[i].blk,
                                pts: nbaRecentPlayers[i].pts,
                                fgPctRank: nbaRecentPlayers[i].fgPctRank,
                                ftPctRank: nbaRecentPlayers[i].ftPctRank,
                                fg3mRank: nbaRecentPlayers[i].fg3mRank,
                                rebRank: nbaRecentPlayers[i].rebRank,
                                astRank: nbaRecentPlayers[i].astRank,
                                tovRank: nbaRecentPlayers[i].tovRank,
                                stlRank: nbaRecentPlayers[i].stlRank,
                                blkRank: nbaRecentPlayers[i].blkRank,
                                ptsRank: nbaRecentPlayers[i].ptsRank,
                                ftRating: nbaRecentPlayers[i].ftRating,
                                fgRating: nbaRecentPlayers[i].fgRating,
                                ptsRating: nbaRecentPlayers[i].ptsRating,
                                threeRating: nbaRecentPlayers[i].threeRating,
                                rebRating: nbaRecentPlayers[i].rebRating,
                                astRating: nbaRecentPlayers[i].astRating,
                                stlRating: nbaRecentPlayers[i].stlRating,
                                blkRating: nbaRecentPlayers[i].blkRating,
                                toRating: nbaRecentPlayers[i].toRating,
                                overallRating: nbaRecentPlayers[i].overallRating,
                                overallRank: playerRank
                            });
                            playerRank++
                        }

                    }
                    callback()
                }
            }, function (err, results) {
                //Here put the creation of the standard deviations and stuff and making the rankings prob
                // console.log(PlayerSeasonData.find({}))
                PlayerSeasonData.find({}, function (err, players) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json('Rankings Completed');
                    }
                });
            });
        })
    })
}