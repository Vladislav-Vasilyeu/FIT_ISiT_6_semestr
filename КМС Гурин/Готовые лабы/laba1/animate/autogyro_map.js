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
		// Останавливаем timeline
		this.stop();
		
		console.log("=== СКРИПТ ЗАПУЩЕН ===");
		console.log("Stage:", this.stage);
		console.log("Root:", this);
		console.log("Canvas:", this.stage.canvas);
		
		// === СОЗДАНИЕ КНОПКИ АКТИВАЦИИ ЗВУКА ===
		var stage = this.stage;
		var root = this;
		
		var buttonText = new createjs.Text("🔊 ВКЛЮЧИТЬ ЗВУК", "bold 24px Arial", "#ffffff");
		buttonText.textAlign = "center";
		buttonText.textBaseline = "middle";
		
		var buttonBg = new createjs.Shape();
		var btnWidth = 250;
		var btnHeight = 60;
		buttonBg.graphics.beginFill("#1e3c72").drawRoundRect(-btnWidth/2, -btnHeight/2, btnWidth, btnHeight, 10);
		
		var startButton = new createjs.Container();
		startButton.addChild(buttonBg, buttonText);
		startButton.x = stage.canvas.width / 2;
		startButton.y = stage.canvas.height / 2;
		startButton.cursor = "pointer";
		
		stage.addChild(startButton);
		console.log("Кнопка старта создана");
		
		// === ПРОВЕРКА КНОПОК ЭЛЕМЕНТОВ ===
		console.log("=== ПРОВЕРКА КНОПОК ===");
		console.log("rotor_btn:", this.rotor_btn);
		console.log("cockpit_btn:", this.cockpit_btn);
		console.log("engine_btn:", this.engine_btn);
		console.log("propeller_btn:", this.propeller_btn);
		console.log("tail_btn:", this.tail_btn);
		console.log("chassis_btn:", this.chassis_btn);
		console.log("fuselage_btn:", this.fuselage_btn);
		console.log("controls_btn:", this.controls_btn);
		
		// Проверим все дочерние элементы
		console.log("=== ВСЕ ДОЧЕРНИЕ ЭЛЕМЕНТЫ ===");
		for (var i = 0; i < this.numChildren; i++) {
		    var child = this.getChildAt(i);
		    console.log(i + ":", child.name, "-", child);
		}
		
		// === ИНИЦИАЛИЗАЦИЯ ЗВУКА ===
		createjs.Sound.alternateExtensions = ["wav"];
		
		var soundFiles = [
		    {id: "rotor", src: "rotor.wav"},
		    {id: "cockpit", src: "cockpit.wav"},
		    {id: "engine", src: "engine.wav"},
		    {id: "propeller", src: "propeller.wav"},
		    {id: "tail", src: "tail.wav"},
		    {id: "chassis", src: "chassis.wav"},
		    {id: "fuselage", src: "fuselage.wav"},
		    {id: "controls", src: "controls.wav"}
		];
		
		var currentSound = null;
		var audioEnabled = false;
		
		// === ОБРАБОТЧИК КНОПКИ СТАРТА ===
		startButton.on("click", function() {
		    console.log("=== КЛИК ПО КНОПКЕ СТАРТА ===");
		    
		    stage.removeChild(startButton);
		    console.log("Кнопка удалена");
		    
		    // Проверяем состояние AudioContext
		    if (createjs.WebAudioPlugin.context) {
		        console.log("AudioContext state:", createjs.WebAudioPlugin.context.state);
		        createjs.WebAudioPlugin.context.resume().then(function() {
		            console.log("AudioContext возобновлен");
		        });
		    }
		    
		    createjs.Sound.registerSounds(soundFiles, "sounds/");
		    console.log("Звуки зарегистрированы");
		    
		    createjs.Sound.on("fileload", function(e) {
		        console.log("Загружен:", e.id);
		        if (!audioEnabled) {
		            audioEnabled = true;
		            console.log("=== АУДИО АКТИВИРОВАНО ===");
		            var testSound = createjs.Sound.play("rotor");
		            console.log("Тестовый звук:", testSound);
		        }
		    });
		});
		
		// === ФУНКЦИЯ ВОСПРОИЗВЕДЕНИЯ С ОТЛАДКОЙ ===
		function playSound(soundId) {
		    console.log("=== ВЫЗОВ playSound(" + soundId + ") ===");
		    console.log("audioEnabled:", audioEnabled);
		    
		    if (!audioEnabled) {
		        console.log("АУДИО НЕ АКТИВИРОВАНО!");
		        return;
		    }
		    
		    if (currentSound) {
		        console.log("Останавливаем предыдущий звук");
		        currentSound.stop();
		    }
		    
		    console.log("Пробуем воспроизвести:", soundId);
		    currentSound = createjs.Sound.play(soundId);
		    console.log("Результат:", currentSound);
		    console.log("Звук играет?", currentSound.playState);
		}
		
		// === ПОДКЛЮЧЕНИЕ КНОПОК С МАКСИМАЛЬНОЙ ОТЛАДКОЙ ===
		
		if (this.rotor_btn) {
		    console.log("Подключаем rotor_btn");
		    this.rotor_btn.cursor = "pointer";
		    var rotorInstance = this.rotor_btn;
		    this.rotor_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА rotor_btn <<<");
		        console.log("this:", this);
		        console.log("rotorInstance:", rotorInstance);
		        playSound("rotor"); 
		    });
		    this.rotor_btn.on("click", function(){ 
		        console.log(">>> КЛИК ПО rotor_btn <<<");
		        playSound("rotor"); 
		    });
		} else {
		    console.log("!!! rotor_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.cockpit_btn) {
		    console.log("Подключаем cockpit_btn");
		    this.cockpit_btn.cursor = "pointer";
		    this.cockpit_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА cockpit_btn <<<");
		        playSound("cockpit"); 
		    });
		} else {
		    console.log("!!! cockpit_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.engine_btn) {
		    console.log("Подключаем engine_btn");
		    this.engine_btn.cursor = "pointer";
		    this.engine_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА engine_btn <<<");
		        playSound("engine"); 
		    });
		} else {
		    console.log("!!! engine_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.propeller_btn) {
		    console.log("Подключаем propeller_btn");
		    this.propeller_btn.cursor = "pointer";
		    this.propeller_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА propeller_btn <<<");
		        playSound("propeller"); 
		    });
		} else {
		    console.log("!!! propeller_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.tail_btn) {
		    console.log("Подключаем tail_btn");
		    this.tail_btn.cursor = "pointer";
		    this.tail_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА tail_btn <<<");
		        playSound("tail"); 
		    });
		} else {
		    console.log("!!! tail_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.chassis_btn) {
		    console.log("Подключаем chassis_btn");
		    this.chassis_btn.cursor = "pointer";
		    this.chassis_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА chassis_btn <<<");
		        playSound("chassis"); 
		    });
		} else {
		    console.log("!!! chassis_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.fuselage_btn) {
		    console.log("Подключаем fuselage_btn");
		    this.fuselage_btn.cursor = "pointer";
		    this.fuselage_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА fuselage_btn <<<");
		        playSound("fuselage"); 
		    });
		} else {
		    console.log("!!! fuselage_btn НЕ НАЙДЕН !!!");
		}
		
		if (this.controls_btn) {
		    console.log("Подключаем controls_btn");
		    this.controls_btn.cursor = "pointer";
		    this.controls_btn.on("mouseover", function(){ 
		        console.log(">>> НАВЕДЕНО НА controls_btn <<<");
		        playSound("controls"); 
		    });
		} else {
		    console.log("!!! controls_btn НЕ НАЙДЕН !!!");
		}
		
		console.log("=== ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// controls_zone
	this.controls_btn = new lib.controls_btn();
	this.controls_btn.name = "controls_btn";
	this.controls_btn.setTransform(738.65,464.9,1,1,0,0,0,65.3,50);
	new cjs.ButtonHelper(this.controls_btn, 0, 1, 2, false, new lib.controls_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.controls_btn).wait(1));

	// cockpit_zone
	this.cockpit_btn = new lib.cockpit_btn();
	this.cockpit_btn.name = "cockpit_btn";
	this.cockpit_btn.setTransform(665.55,424.7,1,1,0,0,0,147.8,108);
	new cjs.ButtonHelper(this.cockpit_btn, 0, 1, 2, false, new lib.cockpit_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.cockpit_btn).wait(1));

	// engine_zone
	this.engine_btn = new lib.engine_btn();
	this.engine_btn.name = "engine_btn";
	this.engine_btn.setTransform(430.2,345.85,1,1,0,0,0,45.5,43);
	new cjs.ButtonHelper(this.engine_btn, 0, 1, 2, false, new lib.engine_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.engine_btn).wait(1));

	// fuselage_zone
	this.fuselage_btn = new lib.fuselage_btn();
	this.fuselage_btn.name = "fuselage_btn";
	this.fuselage_btn.setTransform(681.3,407.75,1,1,0,0,0,303.6,150.5);
	new cjs.ButtonHelper(this.fuselage_btn, 0, 1, 2, false, new lib.fuselage_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.fuselage_btn).wait(1));

	// chassis_zone
	this.chassis_btn = new lib.chassis_btn();
	this.chassis_btn.name = "chassis_btn";
	this.chassis_btn.setTransform(657.7,586,1,1,0,0,0,270.5,85.5);
	new cjs.ButtonHelper(this.chassis_btn, 0, 1, 2, false, new lib.chassis_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.chassis_btn).wait(1));

	// tail_zone
	this.tail_btn = new lib.tail_btn();
	this.tail_btn.name = "tail_btn";
	this.tail_btn.setTransform(214.5,487.75,1,1,0,0,0,173.8,98.4);
	new cjs.ButtonHelper(this.tail_btn, 0, 1, 2, false, new lib.tail_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.tail_btn).wait(1));

	// propeller_zone
	this.propeller_btn = new lib.propeller_btn();
	this.propeller_btn.name = "propeller_btn";
	this.propeller_btn.setTransform(348.3,397.2,1,1,0,0,0,73.4,131.2);
	new cjs.ButtonHelper(this.propeller_btn, 0, 1, 2, false, new lib.propeller_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.propeller_btn).wait(1));

	// rotor_zone
	this.rotor_btn = new lib.rotor_btn();
	this.rotor_btn.name = "rotor_btn";
	this.rotor_btn.setTransform(510.75,157.9,1,1,0,0,0,514.5,128);
	new cjs.ButtonHelper(this.rotor_btn, 0, 1, 2, false, new lib.rotor_btn(), 3);

	this.timeline.addTween(cjs.Tween.get(this.rotor_btn).wait(1));

	// main
	this.instance = new lib.autogyro_main();
	this.instance.setTransform(1,2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

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
		{src:"images/CachedBmp_8.png?1772915690660", id:"CachedBmp_8"},
		{src:"images/autogyro_map_atlas_1.png?1772915690627", id:"autogyro_map_atlas_1"}
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