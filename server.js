// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var sys = require('sys');

const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

connectToObs();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(express.static("public"));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

var availableScenes = [];
var activeRotation = [];
var transitionList = [];
var interval = 3000;
var reconnectInterval = 5000;
var timerObj;
var reconnectTimer;
var index = 0;
var connected = false;
var live = false;

const defaultTransition = 'default'

router.put('/interval', function (req, res) {
	if(!isNaN(req.body.interval))
	{
		interval = req.body.interval;

		clearInterval(timerObj);
		timerObj = setInterval(updateScene, interval);

		console.log("Interval set to " + interval)

		res.status(204).end();
	}
	else
	{
		res.status(500).end();		
	}
});

router.put('/toggle', function (req, res) {


	var found = false;
	var element = req.body.toggle;

	console.log(element);
	availableScenes.forEach(function(scene){
		if(scene === element)
		{
			var index = availableScenes.indexOf(scene);
			availableScenes.splice(index, 1);
			activeRotation.push(element);

			found = true;
			res.status(200).end();

		}
	});

	if(!found){
		activeRotation.forEach(function(scene){
			if(scene === element)
			{
				var index = activeRotation.indexOf(scene);
				activeRotation.splice(index, 1);
				availableScenes.push(element);

				res.status(204).end();
				return;
			}
		});	
	}


	res.status(500).end();
});

router.get('/interval', function(req, res) {             
	res.json(interval);
});

router.get('/active', function(req, res) {             
	res.json(activeRotation);
});

router.get('/available', function(req, res) {             
	res.json(availableScenes);
});

router.get('/reload', function(req, res) {             
	reloadScene();
	res.status(200).end();
});

router.get('/connectionStatus', function(req, res) {
	res.json({connectedToObs: connected, conntectedToTwitch: live});
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('OBS Rotator started on: ' + port);

// You must add this handler to avoid uncaught exceptions.
obs.on('error', err => {
	console.error('socket error:', err);
});

obs.onConnectionOpened(() => {
	clearInterval(reconnectTimer);
	console.log('OBS Connection Opened');
	connected = true;
	reloadScene();
	reloadTransitions();
	timerObj = setInterval(updateScene, interval);
});

obs.onConnectionClosed(() => {
	console.log('OBS Connection Close');
	connected = false;
	// start reconnect timer
	setTimeout(connectToObs, 1500);
});

obs.onStreamStarted(() => {
	console.log('OBS is live');
	live = true;
});

obs.onStreamStopped(() => {
	console.log('OBS is not live anymore');
	live = false;
});

function connectToObs() {
	obs.connect({ address: '127.0.0.1:4444'})
		.catch(err => { // Promise convention dicates you have a catch on every chain.
			console.log(err);
	});			
}  

function updateScene() {  
	if(index >= activeRotation.length)
		index = 0;

	if(0 == activeRotation.length)
	{
		console.log("No Scenes in active pool");
		return;
	}

	const newSceneName = activeRotation[index];
	var transitionName = defaultTransition;
	if(0 <= transitionList.indexOf(newSceneName))
	{
		transitionName = newSceneName;
	}

	// First Set Transition
	obs.setCurrentTransition({'transition-name': transitionName}, (err, data) => {
		// Switch Scene with new transition
		obs.setCurrentScene({'scene-name': newSceneName}, (err, data) => {
			console.log('Set Scene ' + newSceneName);
			index++;
		});
	});
}

function reloadScene() {
	// Send some requests.
	obs.getSceneList({}, (err, data) => {
		//var obj = JSON.parse(data);
		availableScenes = [];
		activeRotation = [];

		activeRotation = data.scenes.map(scene => scene.name);
	});
	return;
}

function reloadTransitions() {
	// Send some requests.
	obs.getTransitionList({}, (err, data) => {
		transitionList = data.transitions.map(transition => transition.name);
	});

	return;
}
