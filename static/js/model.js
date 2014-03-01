/* Main */

reset();

positionBottom();

$(window).resize(function() {
	positionBottom();
	scrollToBottom();
});

$("#input").focus();

$("#input").on("input", function(e) {
	var value = $(this).val();

	if (value.indexOf(" ") != -1 || value.indexOf(".") != -1) {
		var string = value.trim();
		var sequences = string.split(".");

		for (var i = 0; i < sequences.length; i++) {
			var sequence = sequences[i].trim();
			var terms = sequence.split(" ");

			for (var j = 0; j < terms.length; j++) {
				var term = terms[j];

				if (term.length) {
					feed(term);
				}
			}

			if (i < sequences.length - 1) {
				console.log(".");
				reset();
			}
		}

		$(this).val("");
		positionBottom();
		scrollToBottom();
	}
});

// Disable form submission
$("#input-form").submit(function() {return false;});

/* API functions */

function feed(term) {
	// Strip invalid characters
	term = term.replace(/[^\w\s]|_/g, "").replace(/\s+/g, " ");
	
	var row = appendHistoryRow(term);

	var url = "/_models/" + window.MODEL_ID + "/feed/" + term;
	$.postq("api", url, function(data) {
		updateHistoryRow(row, data[0]);
	});
}

function reset() {
	var row = appendHistoryRowEmpty();

	var url = "/_models/" + window.MODEL_ID + "/reset";
	$.postq("api", url, function(data) {});
}

/* DOM functions */

function appendHistoryRow(term) {
	row = $("<ul class='history-item small-block-grid-2'>" +
	        "<li class='term'>" + term + "</li>" +
	        "<li class='prediction'>" +
	        "<img src='/static/img/loading.gif' />" +
	        "</li>" +
	        "</ul>");
	$("#history").append(row);
	return row;
}

function appendHistoryRowEmpty() {
	row = $("<hr>");
	$("#history").append(row);
	return row;
}

function updateHistoryRow(row, prediction) {
	row.children(".prediction").text(prediction.term.string);
}

function positionBottom() {
	mainContent = $("#main-content");

	position = mainContent.parent().height() -
	           mainContent.height() -
	           20;  // padding
	position = Math.max(0, position);

	mainContent.offset({"top": position});
}

function scrollToBottom() {
	mainWindow = $("#main-window");
	mainWindow.scrollTop(mainWindow.prop("scrollHeight"));
}
