var mapObject = {
	width: 0,
	height: 0,
	array: [],
	tileSize: 20,
	tileHeight: 5,
	canvas: null,
	functions: {
		generateMap: function(width, height){
			noise.seed(Math.random());
			var mult = 0.04;

			this.width = width;
			this.height = height;

			//initial random values
			for (var x = 0; x < this.width; x++){
				for (var y = 0; y < this.width; y++){
					if (this.array[y] == null) this.array[y] = [];
					this.array[y][x] = range(1,10, Math.abs(noise.simplex2(x * mult, y * mult)));
				}
			}

			this.offsetX = ($('#canvas').width() - (this.width * this.tileSize)) / 2;
			this.offsetY = ($('#canvas').height() - (this.height * this.tileSize)) / 2;	
			this.canvas = null;		
		},
		drawMap: function(ctx){
			//prerender map if not already prerended
			if (this.canvas == null){
				var offscreenCanvas = document.createElement('canvas');
	            offscreenCanvas.width = this.width * this.tileSize * 2;
	            offscreenCanvas.height = this.width * this.tileSize;
	            this.canvas = offscreenCanvas;
	            var offscreenCtx = this.canvas.getContext('2d');

				for (var y = 0; y < this.width; y++){
					//if (y > 0) break;
					for (var x = 0; x < this.width; x++){
						//if (x > 0) break;

						var newPoint = toIso(x * this.tileSize, y * this.tileSize);
						var _x = newPoint.x;
						var _y = newPoint.y;

						var projection = 'iso';

						if (projection == '2D'){
							offscreenCtx.rect(x*this.tileSize, y*this.tileSize, this.tileSize, this.tileSize);
							offscreenCtx.stroke();
							offscreenCtx.textAlign = 'center';
							offscreenCtx.fillText(x + ',' + y, x*this.tileSize + this.tileSize/2, y*this.tileSize + this.tileSize/2 + 4);
						} else if (projection == 'iso'){
							var offsetX = (this.width * this.tileSize);

							var p1_1 = toIso(x * this.tileSize, y * this.tileSize), 
								p2_1 = toIso((x+1) * this.tileSize, y * this.tileSize),
								p3_1 = toIso((x+1) * this.tileSize, (y+1) * this.tileSize),
								p4_1 = toIso(x * this.tileSize, (y+1) * this.tileSize);

							var p1_2 = {x: p1_1.x, y: p1_1.y - (this.tileHeight * this.array[y][x])},
								p2_2 = {x: p2_1.x, y: p2_1.y - (this.tileHeight * this.array[y][x])},
								p3_2 = {x: p3_1.x, y: p3_1.y - (this.tileHeight * this.array[y][x])},
								p4_2 = {x: p4_1.x, y: p4_1.y - (this.tileHeight * this.array[y][x])};

							/*drawLine(offscreenCtx, 'blue', offsetX + p1_1.x, p1_1.y, offsetX + p2_1.x, p2_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p2_1.x, p2_1.y, offsetX + p3_1.x, p3_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p3_1.x, p3_1.y, offsetX + p4_1.x, p4_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p4_1.x, p4_1.y, offsetX + p1_1.x, p1_1.y);*/

							drawFilledPolygon(offscreenCtx, '#698038', '#698038', offsetX, p4_1, p4_2, p3_2, p3_1);
							drawFilledPolygon(offscreenCtx, '#7E983D', '#7E983D', offsetX, p4_2, p1_2, p2_2, p3_2);
							drawFilledPolygon(offscreenCtx, '#5B722E', '#5B722E', offsetX, p3_1, p3_2, p2_2, p2_1);

							/*offscreenCtx.fillStyle = 'black';
							offscreenCtx.textAlign = 'center';
							var textPoint = toIso(x*this.tileSize + this.tileSize/2, y*this.tileSize + this.tileSize/2);
							offscreenCtx.fillText(this.array[y][x], offsetX + textPoint.x, textPoint.y);*/
						}
					}
				}

			}
			
			ctx.drawImage(this.canvas, (ctx.canvas.width - (this.tileSize * this.width * 2))/2, this.offsetY);
		}
	}
}

for (var i in mapObject.functions){
	mapObject[i] = mapObject.functions[i]
}

function range(min, max, percent){
	return Math.round(min + (max - min) * percent);
}

function toIso(x, y){
	var tempX = x - y;
	var tempY = (x + y) / 2;
	return {x: tempX, y: tempY};
}

function drawLine(ctx, color, x1, y1, x2, y2){
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}

function drawFilledPolygon(_ctx, colorStroke, colorFill, offsetX, p1, p2, p3, p4){
	_ctx.fillStyle = colorFill;
	_ctx.beginPath();
	_ctx.moveTo(offsetX + p1.x, p1.y);
	_ctx.lineTo(offsetX + p2.x, p2.y);
	_ctx.lineTo(offsetX + p3.x, p3.y);
	_ctx.lineTo(offsetX + p4.x, p4.y);
	_ctx.lineTo(offsetX + p1.x, p1.y);
	_ctx.closePath();
	_ctx.fill();

	_ctx.strokeStyle = colorStroke;
	_ctx.beginPath();
	_ctx.moveTo(offsetX + p1.x, p1.y);
	_ctx.lineTo(offsetX + p2.x, p2.y);
	_ctx.lineTo(offsetX + p3.x, p3.y);
	_ctx.lineTo(offsetX + p4.x, p4.y);
	_ctx.lineTo(offsetX + p1.x, p1.y);
	_ctx.closePath();
	_ctx.stroke();
}