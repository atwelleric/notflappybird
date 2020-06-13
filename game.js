// ~~~~~~~~~~~~~~~~ THIS GAME WAS CREATED FOLLOWING ~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~ THIS VERY AMAZING TUTORIAL AT   ~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~ https://www.youtube.com/watch?v=0ArCFchlTq4 ~~~~

//select canvas
const cvs = document.getElementById('mycanvas');
const ctx = cvs.getContext('2d');
//game vars and const
let frames = 0;
//radian stuff is weird
const DEGREE = Math.PI / 180;
// load sprite img
const sprite = new Image();
sprite.src = 'img/sprite.png';
// ctx.drawImage(sprite, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight)

//load sounds

const SCORE_S = new Audio();
SCORE_S.src = 'sounds/sfx_point.wav';
const FLAP = new Audio();
FLAP.src = 'sounds/sfx_flap.wav';
const HIT = new Audio();
HIT.src = 'sounds/sfx_hit.wav';
const SWOOSHING = new Audio();
SWOOSHING.src = 'sounds/sfx_swooshing.wav';
const DIE = new Audio();
DIE.src = 'sounds/sfx_die.wav';

//game state
const state = {
	current: 0,
	getReady: 0,
	game: 1,
	over: 2,
};
// start button cords
const startBtn = {
	x: 120,
	y: 263,
	w: 83,
	h: 29,
};

//score
const score = {
	best: parseInt(localStorage.getItem('best')) || 0,
	value: 0,
	draw: function () {
		ctx.fillStyle = '#FFF';
		ctx.strokeStyle = '#000';

		if (state.current == state.game) {
			ctx.lineWidth = 2;
			ctx.font = '35px Teko';
			ctx.fillText(this.value, cvs.width / 2, 50);
			ctx.strokeText(this.value, cvs.width / 2, 50);
		} else if (state.current == state.over) {
			ctx.font = '25px Teko';
			ctx.fillText(this.value, 255, 186);
			ctx.strokeText(this.value, 255, 186);
			ctx.fillText(this.best, 255, 228);
			ctx.strokeText(this.best, 255, 228);
		}
	},
	reset: function () {
		this.value = 0;
	},
};
// control game state
cvs.addEventListener('click', function (evt) {
	switch (state.current) {
		case state.getReady:
			state.current = state.game;
			SWOOSHING.play();
			break;
		case state.game:
			bird.flap();
			FLAP.play();
			break;
		case state.over:
			let rect = cvs.getBoundingClientRect();
			let clickX = evt.clientX - rect.left;
			let clickY = evt.clientY - rect.top;

			if (
				clickX >= startBtn.x &&
				clickX <= startBtn.x + startBtn.w &&
				clickY >= startBtn.y &&
				clickY <= startBtn.y + startBtn.h
			) {
				bird.speedReset();
				pipes.reset();
				score.reset();
				state.current = state.getReady;
			}
			break;
	}
});

// background
const bg = {
	sX: 0,
	sY: 0,
	w: 275,
	h: 276,
	x: 0,
	y: cvs.height - 226,

	draw: function () {
		ctx.drawImage(
			sprite,
			this.sX,
			this.sY,
			this.w,
			this.h,
			this.x,
			this.y,
			this.w,
			this.h
		);

		ctx.drawImage(
			sprite,
			this.sX,
			this.sY,
			this.w,
			this.h,
			this.x + this.w,
			this.y,
			this.w,
			this.h
		);
	},
};
// foreground

const fg = {
	sX: 276,
	sY: 0,
	w: 224,
	h: 112,
	x: 0,
	y: cvs.height - 112,

	dx: 2,

	draw: function () {
		ctx.drawImage(
			sprite,
			this.sX,
			this.sY,
			this.w,
			this.h,
			this.x,
			this.y,
			this.w,
			this.h
		);
		ctx.drawImage(
			sprite,
			this.sX,
			this.sY,
			this.w,
			this.h,
			this.x + this.w,
			this.y,
			this.w,
			this.h
		);
	},
	update: function () {
		if (state.current == state.game) {
			this.x = (this.x - this.dx) % (this.w / 2);
		}
	},
};
//bird
const bird = {
	animation: [
		{ sX: 276, sY: 112 },
		{ sX: 276, sY: 139 },
		{ sX: 276, sY: 164 },
		{ sX: 276, sY: 139 },
	],
	x: 50,
	y: 150,
	w: 34,
	h: 26,

	frame: 0,

	speed: 0,
	gravity: 0.25,
	jump: 4.6,

	radius: 12,

	rotation: 0,

	draw: function () {
		let bird = this.animation[this.frame];
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation);

		ctx.drawImage(
			sprite,
			bird.sX,
			bird.sY,
			this.w,
			this.h,
			-this.w / 2,
			-this.h / 2,
			this.w,
			this.h
		);

		ctx.restore();
	},
	flap: function () {
		this.speed = -this.jump;
	},

	update: function () {
		//if game state is ready bird must flap slowly
		this.period = state.current == state.getReady ? 10 : 5;
		//increment frame by 1 each period
		this.frame += frames % this.period == 0 ? 1 : 0;
		//frame goes from 0 to4, then back to 0
		this.frame = this.frame % this.animation.length;

		if (state.current === state.getReady) {
			this.y = 150; //reset position of bird after game
			this.rotation = 0 * DEGREE;
		} else {
			this.speed += this.gravity;
			this.y += this.speed;

			if (this.y + this.h / 2 >= cvs.height - fg.h) {
				this.y = cvs.height - fg.h - this.h / 2;
				if (state.current == state.game) {
					state.current = state.over;
					DIE.play();
				}
			}
			//if speed is greater than jump that means bird is falling
			if (this.speed >= this.jump) {
				this.rotation = 90 * DEGREE;
				this.frame = 1;
			} else {
				this.rotation = -25 * DEGREE;
			}
		}
	},
	speedReset: function () {
		this.speed = 0;
	},
};
//pipes
const pipes = {
	bottom: {
		sX: 502,
		sY: 0,
	},
	top: {
		sX: 553,
		sY: 0,
	},
	w: 53,
	h: 400,
	gap: 85,
	dx: 2,
	position: [],
	maxYPos: -150,

	update: function () {
		if (state.current !== state.game) return;

		if (frames % 100 == 0) {
			this.position.push({
				x: cvs.width,
				y: this.maxYPos * (Math.random() + 1),
			});
		}
		for (let i = 0; i < this.position.length; i++) {
			let p = this.position[i];

			// collision detections with right side of bird, left side of top pipe and bottom of top pipe
			let bottomPipeY = p.y + this.gap + this.h;
			if (
				bird.x + bird.radius > p.x &&
				bird.x - bird.radius < p.x + this.w &&
				bird.y + bird.radius > p.y &&
				bird.y - bird.radius < p.y + this.h
			) {
				state.current = state.over;
				HIT.play();
			}
			//collison detection for right side of bird radius, left side of bottom pipe and top of bottm pipe
			if (
				bird.x + bird.radius > p.x &&
				bird.x - bird.radius < p.x + this.w &&
				bird.y + bird.radius > bottomPipeY &&
				bird.y - bird.radius < bottomPipeY + this.h
			) {
				state.current = state.over;
				HIT.play();
			}
			//move the pipes to the left
			p.x -= this.dx;
			// if pipe goes beyond screen, shift the array so first item removes
			if (p.x + this.w <= 0) {
				this.position.shift();
				score.value += 1;
				SCORE_S.play();
				score.best = Math.max(score.value, score.best);
				localStorage.setItem('best', score.best);
			}
		}
	},
	reset: function () {
		this.position = [];
	},

	draw: function () {
		for (let i = 0; i < this.position.length; i++) {
			let p = this.position[i];

			let topYPos = p.y;
			let bottomYPos = p.y + this.h + this.gap;

			//top pipe
			ctx.drawImage(
				sprite,
				this.top.sX,
				this.top.sY,
				this.w,
				this.h,
				p.x,
				topYPos,
				this.w,
				this.h
			);

			//bottom pipe
			ctx.drawImage(
				sprite,
				this.bottom.sX,
				this.bottom.sY,
				this.w,
				this.h,
				p.x,
				bottomYPos,
				this.w,
				this.h
			);
		}
	},
};

//get ready

const getReady = {
	sX: 0,
	sY: 228,
	w: 173,
	h: 152,
	x: cvs.width / 2 - 173 / 2,
	y: 80,

	draw: function () {
		if (state.current == state.getReady) {
			ctx.drawImage(
				sprite,
				this.sX,
				this.sY,
				this.w,
				this.h,
				this.x,
				this.y,
				this.w,
				this.h
			);
		}
	},
};

//game over
const gameOver = {
	sX: 175,
	sY: 228,
	w: 225,
	h: 202,
	x: cvs.width / 2 - 225 / 2,
	y: 90,

	draw: function () {
		if (state.current == state.over) {
			ctx.drawImage(
				sprite,
				this.sX,
				this.sY,
				this.w,
				this.h,
				this.x,
				this.y,
				this.w,
				this.h
			);
		}
	},
};
//draw
function draw() {
	ctx.fillStyle = '#70c5ce';
	ctx.fillRect(0, 0, cvs.width, cvs.height);
	bg.draw();
	pipes.draw();
	fg.draw();
	bird.draw();
	getReady.draw();
	gameOver.draw();
	score.draw();
}
function update() {
	bird.update();
	fg.update();
	pipes.update();
}
function loop() {
	update();
	draw();
	frames++;

	requestAnimationFrame(loop);
}

loop();
