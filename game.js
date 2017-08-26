var lastUpdate = new Date().getTime();
var ctx = null;

var Game = {
	map: mapObject,
	time: {
		targetFPS: 144,
		fpsQueue: [],
		FPS: 0,
		deltaT: 0,
		calculateFPS: function(){
			var now = new Date().getTime();
			Game.time.deltaT = now - lastUpdate;
			lastUpdate = now;
			currentFPS = 1000/Game.time.deltaT;
			Game.time.fpsQueue.push(currentFPS);
			if (Game.time.fpsQueue.length > Game.time.targetFPS) Game.time.fpsQueue.shift();

			var totalFPS = 0;
			for (var i in Game.time.fpsQueue) totalFPS += Game.time.fpsQueue[i];
			Game.time.FPS = totalFPS / Game.time.fpsQueue.length;
		},
		drawFPS: function(){
			ctx.fillStyle = "#02ca02"; 
			ctx.fillText("FPS: " + Math.round(Game.time.FPS*10)/10, 10, 16);
		}
	}
};

$(document).ready(function(){
	init();

	var onEachFrame;
	if (window.webkitRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() { cb(); webkitRequestAnimationFrame(_cb); }
			_cb();
		};
	} else if (window.mozRequestAnimationFrame) {
		onEachFrame = function(cb) {
			var _cb = function() { cb(); mozRequestAnimationFrame(_cb); }
			_cb();
		};
	} else {
		onEachFrame = function(cb) {
			setInterval(cb, 1000 / Game.time.targetFPS);
		}
	}

	window.onEachFrame = onEachFrame;
	window.onEachFrame(mainLoop);
});


function init(){
	ctx = $('#canvas').get(0).getContext('2d');
	Game.map.generateMap(50,50);
}

function mainLoop(){
	update();
	draw();
}

function update(){
	Game.time.calculateFPS();
}

function draw(){
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	Game.map.drawMap(ctx);
	Game.time.drawFPS();
}