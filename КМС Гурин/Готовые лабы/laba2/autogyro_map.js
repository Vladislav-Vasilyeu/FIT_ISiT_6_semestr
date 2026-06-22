(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"autogyro_map_atlas_1", frames: [[1026,277,696,394],[1216,1107,294,525],[0,745,1214,602],[1724,479,182,172],[1724,277,261,200],[1216,673,591,432],[1026,0,1002,275],[1512,1107,462,283],[0,0,1024,743]]}
];


(lib.AnMovieClip = function(){
	this.actionFrames = [];
	this.ignorePause = false;
	this.gotoAndPlay = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndPlay.call(this,positionOrLabel);
	}
	this.play = function(){
		cjs.MovieClip.prototype.play.call(this);
	}
	this.gotoAndStop = function(positionOrLabel){
		cjs.MovieClip.prototype.gotoAndStop.call(this,positionOrLabel);
	}
	this.stop = function(){
		cjs.MovieClip.prototype.stop.call(this);
	}
}).prototype = p = new cjs.MovieClip();
// symbols:



(lib.CachedBmp_9 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(0);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_8 = function() {
	this.initialize(img.CachedBmp_8);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2058,512);


(lib.CachedBmp_7 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(1);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_6 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(2);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_5 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(3);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_4 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(4);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_3 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(5);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_2 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(6);
}).prototype = p = new cjs.Sprite();



(lib.CachedBmp_1 = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(7);
}).prototype = p = new cjs.Sprite();



(lib.autogyro_main = function() {
	this.initialize(ss["autogyro_map_atlas_1"]);
	this.gotoAndStop(8);
}).prototype = p = new cjs.Sprite();



(lib.tail_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_9();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,348,197);


(lib.rotor_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_8();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1029,256);


(lib.propeller_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_7();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,147,262.5);


(lib.fuselage_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_6();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,607,301);


(lib.engine_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_5();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,91,86);


(lib.controls_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_4();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,130.5,100);


(lib.cockpit_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_3();
	this.instance.setTransform(0,0,0.5,0.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(3).to({_off:false},0).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,295.5,216);


(lib.chassis_btn = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	// Слой_1
	this.instance = new lib.CachedBmp_2();
	this.instance.setTransform(39.95,33.75,0.5,0.5);

	this.instance_1 = new lib.CachedBmp_1();
	this.instance_1.setTransform(0,0,0.5,0.5);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1},{t:this.instance}]},3).wait(1));

	this._renderFirstFrame();

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,541,171.3);


// stage content:
(lib.autogyro_map = function(mode,startPosition,loop,reversed) {
if (loop == null) { loop = true; }
if (reversed == null) { reversed = false; }
	var props = new Object();
	props.mode = mode;
	props.startPosition = startPosition;
	props.labels = {};
	props.loop = loop;
	props.reversed = reversed;
	cjs.MovieClip.apply(this,[props]);

	this.actionFrames = [0];
	this.isSingleFrame = false;
	// timeline functions:
	this.frame_0 = function() {
		if(this.isSingleFrame) {
			return;
		}
		if(this.totalFrames == 1) {
			this.isSingleFrame = true;
		}
		// Останавливаем воспроизведение временной шкалы
		stop();
		
		// Получаем ссылки на кнопки из библиотеки
		var rotorBtn = this.rotor_btn;
		var cockpitBtn = this.cockpit_btn;
		var engineBtn = this.engine_btn;
		var propellerBtn = this.propeller_btn;
		var tailBtn = this.tail_btn;
		var chassisBtn = this.chassis_btn;
		var fuselageBtn = this.fuselage_btn;
		var controlsBtn = this.controls_btn;
		
		// Переменная для текущего звука
		var currentSound = null;
		
		// Функция воспроизведения звука
		function playSound(soundName) {
		    // Останавливаем предыдущий звук если есть
		    if (currentSound) {
		        currentSound.stop();
		    }
		    
		    // Создаем и воспроизводим новый звук
		    createjs.Sound.registerSound(soundName, soundName);
		    currentSound = createjs.Sound.play(soundName);
		}
		
		// Назначаем обработчики событий наведения мыши
		
		rotorBtn.addEventListener("mouseover", function() {
		    playSound("rotor.mp3");
		});
		
		cockpitBtn.addEventListener("mouseover", function() {
		    playSound("cockpit.mp3");
		});
		
		engineBtn.addEventListener("mouseover", function() {
		    playSound("engine.mp3");
		});
		
		propellerBtn.addEventListener("mouseover", function() {
		    playSound("propeller.mp3");
		});
		
		tailBtn.addEventListener("mouseover", function() {
		    playSound("tail.mp3");
		});
		
		chassisBtn.addEventListener("mouseover", function() {
		    playSound("chassis.mp3");
		});
		
		fuselageBtn.addEventListener("mouseover", function() {
		    playSound("fuselage.mp3");
		});
		
		controlsBtn.addEventListener("mouseover", function() {
		    playSound("controls.mp3");
		});
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// controls_zone
	this.instance = new lib.controls_btn();
	this.instance.setTransform(738.65,464.9,1,1,0,0,0,65.3,50);
	new cjs.ButtonHelper(this.instance, 0, 1, 2, false, new lib.controls_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	// cockpit_zone
	this.instance_1 = new lib.cockpit_btn();
	this.instance_1.setTransform(665.55,424.7,1,1,0,0,0,147.8,108);
	new cjs.ButtonHelper(this.instance_1, 0, 1, 2, false, new lib.cockpit_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

	// engine_zone
	this.instance_2 = new lib.engine_btn();
	this.instance_2.setTransform(430.2,345.85,1,1,0,0,0,45.5,43);
	new cjs.ButtonHelper(this.instance_2, 0, 1, 2, false, new lib.engine_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1));

	// fuselage_zone
	this.instance_3 = new lib.fuselage_btn();
	this.instance_3.setTransform(681.3,407.75,1,1,0,0,0,303.6,150.5);
	new cjs.ButtonHelper(this.instance_3, 0, 1, 2, false, new lib.fuselage_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(1));

	// chassis_zone
	this.instance_4 = new lib.chassis_btn();
	this.instance_4.setTransform(657.7,586,1,1,0,0,0,270.5,85.5);
	new cjs.ButtonHelper(this.instance_4, 0, 1, 2, false, new lib.chassis_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(1));

	// tail_zone
	this.instance_5 = new lib.tail_btn();
	this.instance_5.setTransform(214.5,487.75,1,1,0,0,0,173.8,98.4);
	new cjs.ButtonHelper(this.instance_5, 0, 1, 2, false, new lib.tail_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(1));

	// propeller_zone
	this.instance_6 = new lib.propeller_btn();
	this.instance_6.setTransform(348.3,397.2,1,1,0,0,0,73.4,131.2);
	new cjs.ButtonHelper(this.instance_6, 0, 1, 2, false, new lib.propeller_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(1));

	// rotor_zone
	this.instance_7 = new lib.rotor_btn();
	this.instance_7.setTransform(510.75,157.9,1,1,0,0,0,514.5,128);
	new cjs.ButtonHelper(this.instance_7, 0, 1, 2, false, new lib.rotor_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(1));

	// main
	this.instance_8 = new lib.autogyro_main();
	this.instance_8.setTransform(1,2);

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(1));

	this._renderFirstFrame();

}).prototype = p = new lib.AnMovieClip();
p.nominalBounds = new cjs.Rectangle(508.3,373.5,517,371.5);
// library properties:
lib.properties = {
	id: '83DA891F08B98A4E943758306FC04C66',
	width: 1024,
	height: 743,
	fps: 30,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"images/CachedBmp_8.png", id:"CachedBmp_8"},
		{src:"images/autogyro_map_atlas_1.png", id:"autogyro_map_atlas_1"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['83DA891F08B98A4E943758306FC04C66'] = {
	getStage: function() { return exportRoot.stage; },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}


an.makeResponsive = function(isResp, respDim, isScale, scaleType, domContainers) {		
	var lastW, lastH, lastS=1;		
	window.addEventListener('resize', resizeCanvas);		
	resizeCanvas();		
	function resizeCanvas() {			
		var w = lib.properties.width, h = lib.properties.height;			
		var iw = window.innerWidth, ih=window.innerHeight;			
		var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
		if(isResp) {                
			if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
				sRatio = lastS;                
			}				
			else if(!isScale) {					
				if(iw<w || ih<h)						
					sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==1) {					
				sRatio = Math.min(xRatio, yRatio);				
			}				
			else if(scaleType==2) {					
				sRatio = Math.max(xRatio, yRatio);				
			}			
		}
		domContainers[0].width = w * pRatio * sRatio;			
		domContainers[0].height = h * pRatio * sRatio;
		domContainers.forEach(function(container) {				
			container.style.width = w * sRatio + 'px';				
			container.style.height = h * sRatio + 'px';			
		});
		stage.scaleX = pRatio*sRatio;			
		stage.scaleY = pRatio*sRatio;
		lastW = iw; lastH = ih; lastS = sRatio;            
		stage.tickOnUpdate = false;            
		stage.update();            
		stage.tickOnUpdate = true;		
	}
}
an.handleSoundStreamOnTick = function(event) {
	if(!event.paused){
		var stageChild = stage.getChildAt(0);
		if(!stageChild.paused || stageChild.ignorePause){
			stageChild.syncStreamSounds();
		}
	}
}
an.handleFilterCache = function(event) {
	if(!event.paused){
		var target = event.target;
		if(target){
			if(target.filterCacheList){
				for(var index = 0; index < target.filterCacheList.length ; index++){
					var cacheInst = target.filterCacheList[index];
					if((cacheInst.startFrame <= target.currentFrame) && (target.currentFrame <= cacheInst.endFrame)){
						cacheInst.instance.cache(cacheInst.x, cacheInst.y, cacheInst.w, cacheInst.h);
					}
				}
			}
		}
	}
}


})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;