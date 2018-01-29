// set up ========================
var express  = require('express');
var app      = express();                               // create our app w/ express
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var sys = require('sys');

const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

obs.connect({ address: '127.0.0.1:4444'});



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
var interval = 1500;
var timerObj;
var index = 0;

router.put('/interval', function (req, res) {
	if(!isNaN(req.body.interval))
	{
		interval = req.body.interval;

		clearInterval(timerObj);
		timerObj = setInterval(updateScene, interval);

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

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================

app.listen(port);
console.log('OBS Rotator started on: ' + port);


obs.onConnectionOpened(() => {
	console.log('OBS Connection Opened');
	reloadScene();

	timerObj = setInterval(updateScene, interval);
});


function updateScene() {  
  if(index >= activeRotation.length)
  	index = 0;

  if(0 == activeRotation.length)
  {
  	console.log("No Scenes in active pool");
  	return;
  }
  obs.setCurrentScene({'scene-name': activeRotation[index]}, (err, data) => {
  	console.log('Set Scene ' + activeRotation[index]);

  	index++;
  });
}

function reloadScene() {
// Send some requests.
  obs.getSceneList({}, (err, data) => {
	//var obj = JSON.parse(data);
	availableScenes = [];
	activeRotation = [];
	data.scenes.forEach(function(scene){
	  	activeRotation.push(scene.name);
	});
  });

  return;
}
