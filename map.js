var mapObject = {
	width: 0,
	height: 0,
	array: {height: [], type: []},
	tileSize: 40,
	tileHeight: 15,
	canvas: null,
	allFlat: false,
	colors:{
		topFace: '#718D3D',
		leftFace: '#8BA452',
		rightFace: '#414F21',
		southSlope: '#80A044',
		northSlope: '#607835',
		eastSlope: '#72903E',
		westSlope: '#6F893E',
		neSlope: '#627C36',
		nwSlope: '#5E7539',
		seSlope: '#81A245',
		swSlope: '#7E9B44',
	},
	functions: {
		getType: function(x, y){
			if (this.array.type[y] && this.array.type[y][x])
				return this.array.type[y][x];
			else
				return 'null';
		},
		generateMap: function(width, height){
			seed = oSeed;
			this.canvas = null;					
			var mult = 0.02;

			this.width = width;
			this.height = height;

			noise.seed(random());
			var xOffset = range(0, 1000000, random());
			var yOffset = range(0, 1000000, random());

			for (var x = 0; x < this.width; x++){
				for (var y = 0; y < this.width; y++){
					if (this.array.height[y] == null) this.array.height[y] = [];
					if (this.array.type[y] == null) this.array.type[y] = [];
					this.array.height[y][x] = range(1,10, Math.abs(noise.simplex2((x + xOffset) * mult, (y + yOffset) * mult)));
					this.array.type[y][x] = 'flat'; 
				}
			}

			this.offsetX = ($('#canvas').width() - (this.width * this.tileSize)) / 2;
			this.offsetY = ($('#canvas').height() - (this.height * this.tileSize)) / 2;	

			if (this.allFlat) return;

			for (var x = 0; x < this.width; x++){
				for (var y = 0; y < this.width; y++){
					var height = this.array.height[y][x],
						heightUp = this.array.height[y-1] != undefined && this.array.height[y-1][x] != undefined ? this.array.height[y-1][x] : -10,
						heightDown = this.array.height[y+1] != undefined && this.array.height[y+1][x] != undefined ? this.array.height[y+1][x] : -10,
						heightLeft = this.array.height[y][x-1] != undefined ? this.array.height[y][x-1] : -10,
						heightRight = this.array.height[y][x+1] != undefined ? this.array.height[y][x+1] : -10;

					//ramps (direction going down)
					if (height - heightDown == 1 && height == heightLeft && height == heightRight) this.array.type[y][x] = 'ramp_south';
					if (height - heightUp == 1 && height == heightLeft && height == heightRight) this.array.type[y][x] = 'ramp_north';
					if (height - heightRight == 1 && height == heightUp && height == heightDown) this.array.type[y][x] = 'ramp_east';
					if (height - heightLeft == 1 && height == heightUp && height == heightDown) this.array.type[y][x] = 'ramp_west';

					//half bottom ramps
					if (height - heightDown == 1 && height - heightRight == 1 && height == heightLeft && height == heightUp) this.array.type[y][x] = 'half_bottom_ramp_se';
					if (height - heightDown == 1 && height - heightLeft == 1 && height == heightRight && height == heightUp) this.array.type[y][x] = 'half_bottom_ramp_sw';
					if (height - heightUp == 1 && height - heightLeft == 1 && height == heightRight && height == heightDown) this.array.type[y][x] = 'half_bottom_ramp_nw';
					if (height - heightUp == 1 && height - heightRight == 1 && height == heightLeft && height == heightDown) this.array.type[y][x] = 'half_bottom_ramp_ne';
				}
			}

			for (var x = 0; x < this.width; x++){
				for (var y = 0; y < this.width; y++){
					var typeTop = this.getType(x,y-1),
						typeBottom = this.getType(x,y+1),
						typeLeft = this.getType(x-1,y),
						typeRight = this.getType(x+1,y);

					//half top ramps
					if (this.getType(x,y) == 'flat' && (typeRight == 'half_bottom_ramp_ne' || typeRight == 'ramp_north') && (typeTop == 'half_bottom_ramp_ne' || typeTop == 'ramp_east') && !(typeRight == 'ramp_east' && typeTop == 'ramp_north')) this.array.type[y][x] = 'half_top_ramp_ne';
					if (this.getType(x,y) == 'flat' && (typeLeft == 'half_bottom_ramp_nw' || typeLeft == 'ramp_north') && (typeTop == 'half_bottom_ramp_nw' || typeTop == 'ramp_west') && !(typeLeft == 'ramp_west' && typeTop == 'ramp_north')) this.array.type[y][x] = 'half_top_ramp_nw';
					if (this.getType(x,y) == 'flat' && (typeBottom == 'half_bottom_ramp_sw' || typeBottom == 'ramp_west') && (typeLeft == 'half_bottom_ramp_sw' || typeLeft == 'ramp_south') && !(typeBottom == 'ramp_west' && typeLeft == 'ramp_south')) this.array.type[y][x] = 'half_top_ramp_sw';
					if (this.getType(x,y) == 'flat' && (typeBottom == 'half_bottom_ramp_se' || typeBottom == 'ramp_east') && (typeRight == 'half_bottom_ramp_se' || typeRight == 'ramp_south') && !(typeBottom == 'ramp_east' && typeRight == 'ramp_south')) this.array.type[y][x] = 'half_top_ramp_se';
				
					//half n half ramps
					if (typeTop == 'half_bottom_ramp_ne' && typeRight == 'half_bottom_ramp_ne' && typeLeft == 'half_bottom_ramp_sw' && typeBottom == 'half_bottom_ramp_sw') this.array.type[y][x] = 'ne_sw_ramp';
					if (typeTop == 'half_bottom_ramp_nw' && typeLeft == 'half_bottom_ramp_nw' && typeRight == 'half_bottom_ramp_se' && typeBottom == 'half_bottom_ramp_se') this.array.type[y][x] = 'nw_se_ramp';
				}
			}
		},
		drawMap: function(ctx){
			//prerender map if not already prerended
			if (this.canvas == null){
				var offscreenCanvas = document.createElement('canvas');
	            offscreenCanvas.width = this.width * this.tileSize * 2;
	            offscreenCanvas.height = this.width * this.tileSize;
	            var offscreenCtx = offscreenCanvas.getContext('2d');

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

							var p1_2 = {x: p1_1.x, y: p1_1.y - (this.tileHeight * this.array.height[y][x])},
								p2_2 = {x: p2_1.x, y: p2_1.y - (this.tileHeight * this.array.height[y][x])},
								p3_2 = {x: p3_1.x, y: p3_1.y - (this.tileHeight * this.array.height[y][x])},
								p4_2 = {x: p4_1.x, y: p4_1.y - (this.tileHeight * this.array.height[y][x])};

							var p1_15 = {x: p1_1.x, y: p1_2.y + this.tileHeight},
								p2_15 = {x: p2_1.x, y: p2_2.y + this.tileHeight},
								p3_15 = {x: p3_1.x, y: p3_2.y + this.tileHeight},
								p4_15 = {x: p4_1.x, y: p4_2.y + this.tileHeight};

							switch(this.array.type[y][x]){
								case 'flat':
									drawFilledPolygon(offscreenCtx, this.colors.leftFace, offsetX, p4_1, p4_2, p3_2, p3_1);		//left face
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p4_2, p1_2, p2_2, p3_2);		//top face
									drawFilledPolygon(offscreenCtx, this.colors.rightFace, offsetX, p3_1, p3_2, p2_2, p2_1);	//right face
									break;
								case 'ramp_south':
									drawFilledPolygon(offscreenCtx, this.colors.southSlope, offsetX, p4_15, p1_2, p2_2, p3_15);	//sloped face
									drawFilledPolygon(offscreenCtx, this.colors.rightFace, offsetX, p3_15, p2_2, p2_15);		//right face
									break;
								case 'ramp_north':
									drawFilledPolygon(offscreenCtx, this.colors.northSlope, offsetX, p4_2, p1_15, p2_15, p3_2);	//sloped face
									drawFilledPolygon(offscreenCtx, this.colors.rightFace, offsetX, p3_15, p3_2, p2_15);		//right face
									break;
								case 'ramp_east':
									drawFilledPolygon(offscreenCtx, this.colors.eastSlope, offsetX, p3_15, p4_2, p1_2, p2_15);	//sloped face
									drawFilledPolygon(offscreenCtx, this.colors.leftFace, offsetX, p4_15, p4_2, p3_15);			//left face
									break;
								case 'ramp_west':
									drawFilledPolygon(offscreenCtx, this.colors.westSlope, offsetX, p4_15, p1_15, p2_2, p3_2);	//sloped face
									drawFilledPolygon(offscreenCtx, this.colors.leftFace, offsetX, p4_15, p3_2, p3_15);			//left face
									break;
								case 'half_bottom_ramp_se':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_15, p4_15, p2_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.seSlope, offsetX, p2_15, p4_15, p1_2);			//sloped face
									break;
								case 'half_bottom_ramp_sw':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_15, p4_15, p1_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.swSlope, offsetX, p3_15, p1_15, p2_2);			//sloped face
									break;
								case 'half_bottom_ramp_ne':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_15, p1_15, p2_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.neSlope, offsetX, p3_15, p1_15, p4_2);			//sloped face
									break;
								case 'half_bottom_ramp_nw':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p2_15, p4_15, p1_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.nwSlope, offsetX, p2_15, p4_15, p3_2);			//sloped face
									break;
								case 'half_top_ramp_ne':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_2, p4_2, p1_2);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.neSlope, offsetX, p3_2, p1_2, p2_15);			//sloped face
									break;
								case 'half_top_ramp_nw':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_2, p4_2, p2_2);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.nwSlope, offsetX, p4_2, p2_2, p1_15);			//sloped face
									break;
								case 'half_top_ramp_sw':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p3_2, p1_2, p2_2);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.swSlope, offsetX, p3_2, p1_2, p4_15);			//sloped face
									break;
								case 'half_top_ramp_se':
									drawFilledPolygon(offscreenCtx, this.colors.topFace, offsetX, p4_2, p1_2, p2_2);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.seSlope, offsetX, p4_2, p2_2, p3_15);			//sloped face
									break;
								case 'ne_sw_ramp':
									drawFilledPolygon(offscreenCtx, this.colors.neSlope, offsetX, p3_2, p1_2, p2_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.swSlope, offsetX, p3_2, p1_2, p4_15);			//sloped face
									break;
								case 'nw_se_ramp':
									drawFilledPolygon(offscreenCtx, this.colors.neSlope, offsetX, p4_2, p3_2, p1_15);			//flat face
									drawFilledPolygon(offscreenCtx, this.colors.seSlope, offsetX, p4_2, p3_2, p3_15);			//sloped face
									break;
								default: break;
							}
							
							/*drawLine(offscreenCtx, 'blue', offsetX + p1_1.x, p1_1.y, offsetX + p2_1.x, p2_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p2_1.x, p2_1.y, offsetX + p3_1.x, p3_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p3_1.x, p3_1.y, offsetX + p4_1.x, p4_1.y);
							drawLine(offscreenCtx, 'blue', offsetX + p4_1.x, p4_1.y, offsetX + p1_1.x, p1_1.y);

							offscreenCtx.fillStyle = 'black';
							offscreenCtx.textAlign = 'center';
							var textPoint = toIso(x*this.tileSize + this.tileSize/2, y*this.tileSize + this.tileSize/2);
							offscreenCtx.fillText('(' + x + ',' + y + ')', offsetX + textPoint.x, textPoint.y + this.tileHeight/2);*/
						}
					}
				}

				this.canvas = offscreenCanvas;

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

function drawFilledPolygon(_ctx, color, offsetX, p1, p2, p3, p4){
	_ctx.fillStyle = color;
	_ctx.beginPath();
	_ctx.moveTo(offsetX + p1.x, p1.y);
	_ctx.lineTo(offsetX + p2.x, p2.y);
	_ctx.lineTo(offsetX + p3.x, p3.y);
	if (p4 != undefined)
		_ctx.lineTo(offsetX + p4.x, p4.y);
	_ctx.lineTo(offsetX + p1.x, p1.y);
	_ctx.closePath();
	_ctx.fill();

	_ctx.beginPath();
	_ctx.strokeStyle = color;
	_ctx.lineWidth = 1;
	_ctx.moveTo(offsetX + p1.x, p1.y);
	_ctx.lineTo(offsetX + p2.x, p2.y);
	_ctx.lineTo(offsetX + p3.x, p3.y);
	if (p4 != undefined)
		_ctx.lineTo(offsetX + p4.x, p4.y);
	_ctx.lineTo(offsetX + p1.x, p1.y);
	_ctx.closePath();
	_ctx.globalCompositeOperation = 'multiply';
	_ctx.stroke();
	_ctx.globalCompositeOperation = 'source-over';
}

function random() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function toggleAllFlat(){
	Game.map.allFlat = !Game.map.allFlat;
	Game.map.generateMap(50,50);
}