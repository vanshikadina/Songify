/*
Basic express server with middleware, SQLite database, and Handlebars template rendering.

Here we use server-side templating using the Handlebars template engine to generate the HTML for the response pages to send to the client.
Handlebars is a popular templating format/engine.
Other popular ones include: PUG (formarly Jade), EJS, Liquid, Mustache.
Handlebar views are rendered from data obtained from the SQLite database.

The template engine merges data provided in the form of a javascript object
with html represented in the .hbs handlebars template files.
The combination is 'rendered' and sent to the client as .html.

This is an Express 4.x application.
Here we use a routes module. We put our route handling code in
a separate module that is required by the main app.

We use the exported route functions in the 'use' and 'get'
routes. Typically 'use' calls functions that invoke next() whereas our
get and post routes send responses to the client.

*/

//Cntl+C to stop server

var https = require('https');
var express = require('express');
var path = require('path');
var logger = require('morgan');
const handlebars = require('hbs');

handlebars.registerHelper('encodeURIComponent', function(str) {
    return encodeURIComponent(str);
});


var  app = express(); //create express middleware dispatcher

const PORT = process.env.PORT || 3000

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs'); //use hbs handlebars wrapper

// static files middleware
app.use(express.static(path.join(__dirname, 'public')));

app.locals.pretty = true; //to generate pretty view-source code in browser

//read routes modules
var routes = require('./routes/index');

app.use(logger('dev'));


//routes
// Register route
app.post('/register', routes.register);

// Login route
app.post('/login', routes.login);

app.get('/register', routes.register);
app.get('/login', routes.login);
app.get('/songs', (request, response) => {
  console.log(request.path)
	// Get the user role from query parameters
	const userRole = request.query.role; 

	// If the user is an admin, render the page with the additional options
	if (userRole === 'admin') {
	// Render page for admin with additional features
	return response.render('songs', { isAdmin: true });
	} else if(userRole==='guest') {
	// Render normal page for other users
	return response.render('songs', { isAdmin: false });
	}

  let songTitle = request.query.title
  if (!songTitle) {
	return response.render('songs');
  }

  let titleWithPlusSigns = encodeURIComponent(songTitle.trim().replace(/\s/g, '+'))
  console.log('titleWithPlusSigns: ' + titleWithPlusSigns)

  console.log('query: ' + JSON.stringify(request.query))
  if(!songTitle) {
	//send json response to client using response.json() feature
	//of express
	response.json({message: 'Please enter Song Title'})
	return
  }

  //https://itunes.apple.com/search?term=Body+And+Soul&&entity=musicTrack&limit=3
  const options = {
	"method": "GET",
	"hostname": "itunes.apple.com",
	"port": null,
	"path": `/search?term=${titleWithPlusSigns}&entity=musicTrack&limit=20`,
	"headers": {
	  "useQueryString": true
	}
  }
  //create the actual http request and set up
  //its handlers
  https.request(options, function(apiResponse) {
	let songData = ''
	apiResponse.on('data', function(chunk) {
	  songData += chunk
	})
	apiResponse.on('end', function() {
	  let jsonData = JSON.parse(songData);

	  jsonData.results = jsonData.results.slice(0, 20);
	  response.contentType('application/json').json(jsonData);
	})
  }).end() //important to end the request
		   //to actually send the message

})


app.get('/users', routes.users);
app.get('/songs/playlist', routes.playlist);
app.get('/playlist/add', routes.addSongToPlaylist);
app.get('/playlist/remove', routes.removeSongFromPlaylist);
app.get('/remove_user', routes.removeUser);

//start server
app.listen(PORT, err => {
  if(err) console.log(err)
  else {
		console.log(`Server listening on port: ${PORT} CNTL:-C to stop`)
		console.log(`To Test:`)
		console.log('For Login : user: vanshika , password : 1234 and to register enter username and password')
		console.log('http://localhost:3000/login')
	}
})

