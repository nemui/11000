function tree(start_x, start_y, direction, recursion_level, pps, color){	
	this.start_x = start_x;
	this.start_y = start_y;
	this.direction = direction;
	this.pps = pps;
	this.color = color;
	this.tpp = this.TIME_PER_SEGMENT / pps;
	this.time_pile = 0;
	this.pixel_pile = 0;
	this.level = 0;	
	this.axiom = "0";	
	
	for (i = 0; i < recursion_level; i++){
		this.next_axiom = "";
		for (j in this.axiom){			
			if (this.axiom[j] == "0"){
				this.next_axiom += "1[0]0";
			}
			else if (this.axiom[j] == "1"){
				this.next_axiom += "11";
			}
			else {
				this.next_axiom += this.axiom[j];
			}
		}
		this.axiom = this.next_axiom;
	}
	
	var end_of_recursion = this.axiom.indexOf("]");
	var to_the_end_of_recursion = this.axiom.substring(0, end_of_recursion);
	var matches = to_the_end_of_recursion.match(/\[/g);
	if (matches){
		this.levels = matches.length + 1;
	}
	else{
		this.levels = 1;
	}
	var dxdy = this.STUFF[0][this.direction];
	switch (direction){
		case "up": {
			dx = 0;
			dy = -1;
			break;
		}
		case "down": {
			dx = 0;
			dy = 1;
			break;
		}
		case "left": {
			dx = -1;
			dy = 0;
			break;
		}
		case "right": {
			dx = 1;
			dy = 0;
			break;
		}
	}
	this.root = {end_x: start_x, end_y: start_y, dx: dxdy[0], dy: dxdy[1], angle: 0};				
}

tree.prototype.TIME_PER_SEGMENT = 500;
tree.prototype.SPM = tree.prototype.SEGMENT / tree.prototype.TIME_PER_LEVEL;
tree.prototype.STUFF = {
	0: 		{"up": [0, -1], 	"down": [0, 1], 	"right": [1, 0], 	"left": [-1, 0]},
	45: 	{"up": [1, -1], 	"down": [-1, 1], 	"right": [1, 1], 	"left": [-1, -1]},
	90:		{"up": [1, 0], 		"down": [-1, 0], 	"right": [0, 1], 	"left": [0, -1]},
	135: 	{"up": [1, 1], 		"down": [-1, -1], 	"right": [-1, 1], 	"left": [1, -1]},
	180: 	{"up": [0, 1], 		"down": [0, -1], 	"right": [-1, 0], 	"left": [1, 0]},
	"-45": 	{"up": [-1, -1], 	"down": [1, 1], 	"right": [1, -1], 	"left": [-1, 1]},
	"-90": 	{"up": [-1, 0], 	"down": [1, 0], 	"right": [0, -1], 	"left": [0, 1]},
	"-135":	{"up": [-1, 1], 	"down": [1, -1], 	"right": [-1, -1], 	"left": [1, 1]},
}


tree.prototype.render = function(){					
	ctx.beginPath();		
	this.render_r(this.root, this.start_x, this.start_y);
	ctx.stroke();		
}

tree.prototype.render_finished = function(){
	ctx.beginPath();		
	for (var i in this.path){
		if (this.path[i].move){
			ctx.moveTo(this.path[i].x, this.path[i].y);
		}
		else{
			ctx.lineTo(this.path[i].x, this.path[i].y);
		}
	}		
	ctx.stroke();		
}

tree.prototype.render_r = function(seg, start_x, start_y){
	ctx.moveTo(start_x, start_y);	
	ctx.lineTo(seg.end_x, seg.end_y);
	if (seg.progeny){
		for (var i in seg.progeny){
			this.render_r(seg.progeny[i], seg.end_x, seg.end_y);
		}
	}
}

tree.prototype.update = function(dt){	
	this.time_pile += dt;	
	
	if (this.time_pile >= this.tpp){
		this.time_pile = 0;
		
		this.update_r(this.root, this.start_x, this.start_y, 0, 0, this.levels);
		
		this.pixel_pile++;
		if(this.pixel_pile == this.pps){
			this.pixel_pile = 0;
			this.level ++;	
			if (this.level == this.levels){				
				
				this.top = this.bottom = this.start_y;
				this.left = this.right = this.start_x;
				
				this.path = [{move: true, x: this.start_x, y: this.start_y}];
				this.build_path(this.root);
				
				this.update = function(){};
				this.render = this.render_finished;
			}
			else{
				this.add_r(this.root);
			}
		}
	}	
}

tree.prototype.update_r = function(seg, start_x, start_y, dx, dy, p){
	var p2 = p / this.levels;	
	
	var x = seg.dx*p2 + dx;
	var y = seg.dy*p2 + dy;
	seg.end_x += x;
	seg.end_y += y;	
	if (seg.progeny){
		for (var i in seg.progeny){
			this.update_r(seg.progeny[i], seg.end_x, seg.end_y, x, y, p - 1);
		}
	}
}

tree.prototype.add_r = function(seg){
	if (seg.progeny){
		for (var i in seg.progeny){
			this.add_r(seg.progeny[i]);
		}
	}
	else{		
		var angle1 = (seg.angle + 45 > 180) ? -135 : seg.angle + 45;
		var angle2 = (seg.angle - 45 < -135) ? 180 : seg.angle - 45;
		
		var dxdy1 = this.STUFF[angle1][this.direction];
		var dxdy2 = this.STUFF[angle2][this.direction];
				
		var x1 = seg.end_x + dxdy1[0];
		var y1 = seg.end_y + dxdy1[1];
		var x2 = seg.end_x + dxdy2[0];
		var y2 = seg.end_y + dxdy2[1];
						
		seg.progeny = [
			{end_x: x1, end_y: y1, dx: dxdy1[0], dy: dxdy1[1], angle: angle1},
			{end_x: x2, end_y: y2, dx: dxdy2[0], dy: dxdy2[1], angle: angle2},
		]
	}
}

tree.prototype.build_path = function(seg){
	if (seg.end_x < this.left) this.left = seg.end_x;
	if (seg.end_x > this.right) this.left = seg.end_x;
	this.path.push({move: false, x: seg.end_x, y: seg.end_y});
	if (seg.progeny){
		for (var i in seg.progeny){
			this.build_path(seg.progeny[i]);
			if ( i != seg.progeny.length-1) this.path.push({move: true, x: seg.end_x, y: seg.end_y});
		}
	}
}