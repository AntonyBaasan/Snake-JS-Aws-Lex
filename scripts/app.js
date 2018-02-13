var snakeGame;
var fulFillmentCallBack = function (param) {
	if (!param)
		return;

	snakeGame.move(param.slots.Direction);
};

document.addEventListener("DOMContentLoaded", function () {
	// set the focus to the input box
	var textInput = document.getElementById("wisdom");
	if(textInput)
		textInput.focus();

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

function onChatClick() {
	event.preventDefault();
	event.stopPropagation();
	lexApp.sendChat(fulFillmentCallBack);
	return false;
}

function setCredential(code){
	lexApp.setConfig(code)
}





