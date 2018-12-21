function vote() {
	$('.vote').click(function() {

		var voteData = [];

		voteData.push($(this).attr('data-id'), $(this).attr('data-title'));

		var sendData = {
			'betId': $(this).attr('data-id'),
			'betVote': $(this).attr('data-vote-title')
		}

		var voteButton = $(this);

		if (!voteButton.hasClass('vote-selected')) {
			$.ajax({
				url: 'http://localhost:3000/api/vote', //Your api url
				type: 'PUT', //type is any HTTP method
				data: {
					data: sendData
				}, //Data as js object
				success: function(data) {
					var update = true;
					getData(update);
					voteButton.addClass('vote-selected');
					addToLocalStorage(voteData, 'selectedVotes');
				}
			});
		} else {
			$.ajax({
				url: 'http://localhost:3000/api/vote', //Your api url
				type: 'DELETE', //type is any HTTP method
				data: {
					data: sendData
				}, //Data as js object
				success: function(data) {
					var update = true;
					getData(update);
					voteButton.removeClass('vote-selected');
					removeFromLocalStorage(voteData, 'selectedVotes');
				}
			});
		}
	})

}