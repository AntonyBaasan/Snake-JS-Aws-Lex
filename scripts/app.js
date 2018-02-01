var snakeGame;
var fulFillmentCallBack = function (param) {
	if (!param)
		return;

	if (param.slots.Direction == "up") {
		snakeGame.move(38);
	}
	else if (param.slots.Direction == "left") {
		snakeGame.move(37);
	}
	else if (param.slots.Direction == "down") {
		snakeGame.move(40);
	}
	else if (param.slots.Direction == "right") {
		snakeGame.move(39);
	}
};

document.addEventListener("DOMContentLoaded", function () {
	// set the focus to the input box
	document.getElementById("wisdom").focus();

	// The DOM-element which will hold the playfield
	// If you are using jQuery, you can use < var element = $("#parent"); > instead
	var parentElement = document.getElementById("parent");

	// User defined settings overrides default settings.
	// See snake-js.js for all available options.
	var settings = {
		frameInterval: 120,
		backgroundColor: "#f3e698"
	};

	// Create the game object. The settings object is NOT required.
	// The parentElement however is required
	snakeGame = new SnakeJS(parentElement, settings);

}, true);

function onChatClick(){
	event.preventDefault();
	event.stopPropagation();
	lexApp.sendChat(fulFillmentCallBack);
	return false;
}





