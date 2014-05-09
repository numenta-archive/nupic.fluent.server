/* Main */

// jQuery plugin for checking to see if scrollbar is present.
// Courtesy of Reigel: http://stackoverflow.com/questions/4814398/how-can-i-check-if-a-scrollbar-is-visible
(function($) {
    $.fn.hasScrollBar = function() {
        return this.get(0).scrollHeight > this.height();
    }
})(jQuery);

reset();
resizeHistory();
checkScroll();

$(window).resize(function() {
	resizeHistory();
	checkScroll();
});

function checkScroll() {
	var width = 0;
	if ($("#history-container").hasScrollBar()) {
		width = measureScrollBarWidth();
	}
	$(".header .row.headings").css("padding-right",width);
}

function measureScrollBarWidth() {
	var scrollDiv = document.createElement("div");
	scrollDiv.className = "scrollbar-measure";
	document.body.appendChild(scrollDiv);

	// Get the scrollbar width
	var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
	$(".header .row.headings").css("padding-right",scrollbarWidth);

	// Delete the DIV 
	document.body.removeChild(scrollDiv);
	return scrollbarWidth;
}

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
				reset();
			}
		}

		$(this).val("");
		resizeHistory();
		checkScroll();
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
	var learning = $("input[type='radio'][name='learning']:checked").val();
	var payload = {"learning" : learning};
	$.postq("api", url, payload, function(data) {
		updateHistoryRow(row, data);
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

function updateHistoryRow(row, data) {
    var prediction = row.children(".prediction"),
        html;

    html = "<ul class='prediction'>";
    for (i in data) {
        if (i >= 4) break;
        html += "<li class='prediction-item'>" + data[i]['term']['string'] + "</li>";
    }
    html += "</ul>";

    prediction.html(html);
}

function resizeHistory() {
	$("#inner-history-wrapper").height($("#history").height());
	$("#history-container").scrollTop($("#history-container").get(0).scrollHeight);
}

// initialize the page:
