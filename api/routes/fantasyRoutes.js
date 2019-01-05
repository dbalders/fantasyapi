'use strict';
module.exports = function(app) {
    var fantasy = require('../controllers/fantasyController');

    // app.route('/api/season')
    // 	.get(fantasy.list_all_players)
    // 	// .post(fantasy.get_all_bets)
    // 	// .delete(fantasy.delete_all_bets);

    app.route('/api/players/:leagueId')
        .get(fantasy.list_all_players)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/teams/:leagueId')
        .get(fantasy.list_teams)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/teams/:leagueId/:teamKey')
        .get(fantasy.list_teams_players)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/rankings/season/')
        .get(fantasy.list_season_rankings)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/rankings/twoweeks/')
        .get(fantasy.list_two_week_rankings)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/get_rankings')
        .get(fantasy.get_rankings)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/targets/season/:leagueId')
        .get(fantasy.list_season_pickups)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/targets/twoweeks/:leagueId')
        .get(fantasy.list_two_week_pickups)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/espn/league/:espnId')
        .get(fantasy.get_espn_data)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);

    app.route('/api/erase')
        .get(fantasy.erase_current_data)
    // .post(fantasy.get_all_bets)
    // .delete(fantasy.delete_all_bets);
};