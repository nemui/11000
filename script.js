var WIDTH = 0,
	HEIGHT = 0,		
	NOISE_WIDTH = 0,
	NOISE_HEIGHT = 0,
	NOISE_FRAGMENTS = 25,
	TREE_MAX = 101,
	TREE_SEG = 10,
	TREE_LEVEL = 6,
	TREE_COLOR_1 = "#00ff00",
	TREE_COLOR_2 = "#cc00ff",

	canvas = null,
	ctx = null,

	white_noise_canvas = null,
	black_noise_canvas = null,
	unicorn_noise_canvas = null,

	t = null,
	trees = [],
	tree_ground = 0,
	tree_direction = 0,
	tree_x = 0,
	tree_y = 0,	
		
	txt_to_put = [
		"CAUТION", 
		"DО NОT ಠ_ಠ", 
		"YOU ARЕ БEING EXPOSЕD TO INFORMATION POLЛEN",
		"ЕSTИМATED TRАNSMISSION RISK 000%",
		"HАPРY BIRTHДAY, MАRY"
	],		
	txt_typing = "ЕSTИМATED TRАNSMISSION RISK   ",
	txt_typed = "ЕSTИМATED TRАNSMISSION RISK ",
	txt = ["", "", "", "", ""],
	txt_x = [],
	txt_y = [],
	txt_index = 0,
	txt_percent = 0,	
	txt_t = 50,
	txt_t_pile = 0,		
	
	i = 0, 
	j = 0,	

	t_pile = 0,
	t_new_tree = 250,	
	then = Date.now(),
	now = 0,	
	
	degrad_t = [
		1000, 
		3000, 2000, 
		1000, 1000, 
		500, 500, 		
		250, 250, 250, 		
		100, 100, 100, 100,
		50,  50,  50,  50,  50,  50,  50,  50, 50,  50,  50,  50,  50,  50,  50,  50,		 
		50,  50,  50,  50,  50,  50,  50,  50, 50,  50,  50,  50,  50,  50,  50,  50,
		50,  50,  50,  50,  50,  50,  50,  50, 50,  50,  50,  50,  50,  50,  50,  50,		
		3000
	], 
	degrad_index = 0,
	degrad_toggle = 0,
	
	erasing_center_x = 0,
	erasing_center_y = 0;
	erasing_t = 50,
	erasing_w = 0,
	erasing_h = 0,
	erasing_unit = 10,
	erasing_units = 100;	

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame     || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     || 
		  function( callback ){
				window.setTimeout(callback, 1000 / 60);
		  };
})();


function put_down_letters(color){	
	ctx.fillStyle = color;	
	for (i in txt){
		ctx.fillText(txt[i], txt_x[i], txt_y[i]);
	}	
}

function new_tree(){
	tree_ground = ~~(Math.random()*4);
	switch(tree_ground){
		case 0: {
			tree_direction = "up";						
			tree_x = ~~(Math.random()*(WIDTH-100)) + 50;
			tree_y = HEIGHT;
			break;
		}
		case 1: {
			tree_direction = "down";						
			tree_x = ~~(Math.random()*(WIDTH-100)) + 50;
			tree_y = 0;
			break;
		}
		case 2: {
			tree_direction = "right";						
			tree_x = 0;
			tree_y = ~~(Math.random()*(HEIGHT-100)) + 50;
			break;
		}
		case 3: {
			tree_direction = "left";						
			tree_x = WIDTH;
			tree_y = ~~(Math.random()*(HEIGHT-100)) + 50;
			break;
		}
	}
	
	trees.push(
		new tree(tree_x, tree_y, tree_direction, ~~(Math.random()*TREE_LEVEL + TREE_LEVEL/2), ~~(Math.random()*TREE_SEG + TREE_SEG/2), (~~(Math.random()*2)) ? TREE_COLOR_1 : TREE_COLOR_2)		
	);
}

function resize() {	
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;	
	
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	
	ctx.font = "20px GyusanMatrix";	
	ctx.textBaseline = "top";	
	
	erasing_center_x = ~~(WIDTH / 2);
	erasing_center_y = ~~(HEIGHT / 2);
}

function render(){}

function render_growing(){	
	ctx.drawImage(white_noise_canvas, ~~(Math.random()*5)-2, ~~(Math.random()*5)-2);	
	
	put_down_letters("#FFA812");
	
	ctx.strokeStyle = TREE_COLOR_1;
	for (t in trees){
		if (trees[t].color == ctx.strokeStyle){
			trees[t].render();
		}
	}
	
	ctx.strokeStyle = TREE_COLOR_2;
	for (t in trees){
		if (trees[t].color == ctx.strokeStyle){
			trees[t].render();
		}
	}
}

function render_monochrome(){	
	ctx.drawImage(black_noise_canvas, ~~(Math.random()*5)-2, ~~(Math.random()*5)-2);

	put_down_letters("#000000");
	
	ctx.strokeStyle = "#000000";
	for (t in trees){		
		trees[t].render();		
	}		
}

function render_rainbow(){	
	ctx.drawImage(unicorn_noise_canvas, ~~(Math.random()*5)-2, ~~(Math.random()*5)-2);	

	put_down_letters("#ffffff");
	
	ctx.strokeStyle = "#ffffff";
	for (t in trees){		
		trees[t].render();		
	}		
}

function render_erasing(){
	for (var i = 0; i < erasing_units; i++){
		ctx.fillRect(
			~~(Math.random()*erasing_w*2) + erasing_center_x - erasing_w, 
			~~(Math.random()*erasing_h*2) + erasing_center_y - erasing_h, 
			erasing_unit, erasing_unit
		);
    }
}

function update(){}

function update_degrading(){
	t_pile += dt;
	if (t_pile > degrad_t[degrad_index]){
		t_pile = 0;
		degrad_index++;
		if (degrad_index == degrad_t.length){
			ctx.fillStyle = "#ffffff";
			update = update_erasing;
			render = render_erasing;
		}
		else if (degrad_index == degrad_t.length - 1){
			render = render_rainbow;
		}
		else{
			if (degrad_toggle == 0){				
				ctx.clearRect(0, 0, WIDTH, HEIGHT);
				render = render_monochrome;
			}
			else{
				ctx.fillRect(0, 0, WIDTH, HEIGHT);
				render = render_growing;
			}
			degrad_toggle = 1 - degrad_toggle;
		}
	}
}

function update_erasing(){
	t_pile += dt;
	if (t_pile > erasing_t){            
		t_pile = 0;
		erasing_units += 150;
		erasing_unit += 1;
		erasing_w = (erasing_w + erasing_unit > WIDTH) ? WIDTH : erasing_w + erasing_unit;
		erasing_h = (erasing_h + erasing_unit > HEIGHT) ? HEIGHT : erasing_h + erasing_unit;
		if (erasing_w == WIDTH && erasing_h == HEIGHT){
			ctx.clearRect(0, 0, WIDTH, HEIGHT);
			update = function(){};
			render = function(){};					
		}
	}
}

function update_growing(dt){
	
	for (t in trees){
		trees[t].update(dt);
	}
	
	t_pile += dt;
	if (t_pile > t_new_tree){
		t_pile = 0;
		if (trees.length < TREE_MAX){
			new_tree();
		}
	}
	
	txt_t_pile += dt;
	if (txt_t_pile >= txt_t && ~~(Math.random()*2)){
		txt_t_pile = 0;
		if (txt[txt_index].length < txt_to_put[txt_index].length) {
			txt[txt_index] += txt_to_put[txt_index].charAt(txt[txt_index].length);
		}
		else if (txt_index == 3){
			txt_t = 25;
			txt_percent++;			
			txt[txt_index] = txt_typed + ((txt_percent < 10) ? "00" : (txt_percent < 100) ? "0" : "") + txt_percent + "%";
			if (txt_percent == 100){
				txt_index++;
				txt_t = 75;	
				txt_t_pile = -500;				
			}
		}
		else if (txt_index < txt.length){
			txt_index++;
			if (txt_index == txt.length){				
				update = update_degrading;				
				t_pile = -1000;
			}
		}
	}
}

function loop(){
	now = Date.now();
	dt = now - then;
	
	update(dt);
	render();		

	then = now;
	requestAnimFrame( loop );    
}

function init(){
	body = document.getElementById("body");
	canvas = document.getElementById("world");
	
	window.addEventListener('resize', resize, false);
	
	ctx = canvas.getContext("2d");	
	
	resize();		
	
	NOISE_WIDTH = Math.ceil(WIDTH / NOISE_FRAGMENTS);
	NOISE_HEIGHT = Math.ceil(HEIGHT / NOISE_FRAGMENTS),
	
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, WIDTH, HEIGHT);	

	for (i in txt){
		txt_x[i] = ~~((WIDTH - ctx.measureText(txt_to_put[i]).width) / 2);
		txt_y[i] = ~~((HEIGHT - 30*txt.length) / 2 + i*30);
	}	
	
	txt_to_put[3] = txt_typing;
	
	white_noise_canvas = document.createElement('canvas');
	white_noise_canvas.width = WIDTH;
	white_noise_canvas.height = HEIGHT;
	var white_noise_ctx = white_noise_canvas.getContext("2d");
	
	var white_noise_spot = document.createElement('canvas');
	white_noise_spot.width = NOISE_WIDTH;
	white_noise_spot.height = NOISE_HEIGHT;
	var white_noise_spot_ctx = white_noise_spot.getContext("2d");		
	white_noise_spot_ctx.fillStyle = "#000000";
	
	black_noise_canvas = document.createElement('canvas');
	black_noise_canvas.width = WIDTH;
	black_noise_canvas.height = HEIGHT;
	var black_noise_ctx = black_noise_canvas.getContext("2d");
	
	var black_noise_spot = document.createElement('canvas');
	black_noise_spot.width = NOISE_WIDTH;
	black_noise_spot.height = NOISE_HEIGHT;
	var black_noise_spot_ctx = black_noise_spot.getContext("2d");		
	black_noise_spot_ctx.clearRect(0, 0, NOISE_WIDTH, NOISE_HEIGHT);
	black_noise_spot_ctx.fillStyle = "#ffffff";
	
	unicorn_noise_canvas = document.createElement('canvas');
	unicorn_noise_canvas.width = WIDTH;
	unicorn_noise_canvas.height = HEIGHT;
	var unicorn_noise_ctx = unicorn_noise_canvas.getContext("2d");
	
	var unicorn_noise_spot = document.createElement('canvas');
	unicorn_noise_spot.width = NOISE_WIDTH;
	unicorn_noise_spot.height = NOISE_HEIGHT;
	var unicorn_noise_spot_ctx = unicorn_noise_spot.getContext("2d");		
	unicorn_noise_spot_ctx.clearRect(0, 0, NOISE_WIDTH, NOISE_HEIGHT);					
		
	var colors = [];
	var frequency = 5 / NOISE_WIDTH;
	for (i = 0; i < NOISE_WIDTH; i++) {		
		colors[i] = "#" 
		+ byte2Hex(Math.sin(frequency * i + 0) * 127 + 128)
		+ byte2Hex(Math.sin(frequency * i + 2) * 127 + 128)
		+ byte2Hex(Math.sin(frequency * i + 4) * 127 + 128);        
    }
	for (i = 0; i < NOISE_WIDTH; i++){		
		unicorn_noise_spot_ctx.fillStyle = colors[i];
		for (j = 0; j < NOISE_HEIGHT; j++){			
			unicorn_noise_spot_ctx.fillRect(i, j, 1, 1);
			if (~~(Math.random()*2)) {
				white_noise_spot_ctx.fillRect(i, j, 1, 1);
			}
			else{
				black_noise_spot_ctx.fillRect(i, j, 1, 1);
			}
		}
	}	
	
	for (i = 0; i < NOISE_FRAGMENTS; i++){
		for (j = 0; j < NOISE_FRAGMENTS; j++){			
			white_noise_ctx.drawImage(white_noise_spot, i*NOISE_WIDTH, j*NOISE_HEIGHT);
			black_noise_ctx.drawImage(black_noise_spot, i*NOISE_WIDTH, j*NOISE_HEIGHT);
			unicorn_noise_ctx.drawImage(unicorn_noise_spot, i*NOISE_WIDTH, j*NOISE_HEIGHT);			
		}
	}	

	new_tree();	
	
	render = render_growing;
	update = update_growing;
	
	loop();	
}

function byte2Hex(n){	
	return "0123456789ABCDEF".substr((n >> 4) & 0x0F,1) + "0123456789ABCDEF".substr(n & 0x0F,1);
}

window.addEventListener("load", init, false);