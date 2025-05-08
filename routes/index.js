
var url = require('url');
var sqlite3 = require('sqlite3').verbose(); //verbose provides more detailed stack trace
var db = new sqlite3.Database('data/songify');

// Store logged-in users (Key: username, Value: true)
let loggedIn=false; 
let userID = 0;
let userRole="";

exports.register = function (request, response) {
    if (request.method === "GET") {
        response.render('register', { title: "User Registration" });
    } else if (request.method === "POST") {
        let body = '';

        // Collect the incoming data
        request.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        request.on('end', () => {
            // Parse form data manually
            let params = new URLSearchParams(body);
            let username = params.get('username');
            let password = params.get('password');
            let accessCode = params.get('accessCode'); // Access code field

            if (!username || !password) {
                return response.render('register', { error: "All fields are required!" });
            }

            // Check access code (e.g., "2406" is the correct code for admin)
            let role = 'guest';  // Default role is guest
            if (accessCode === '2406') {
                role = 'admin'; // Grant admin role if access code is correct
            } else if (accessCode) {
                // If the access code is provided but incorrect, show an error
                return response.render('register', { error: "Invalid access code!" });
            }

            // Insert user credentials into the database
            db.run("INSERT INTO users (userid, password, role) VALUES (?, ?, ?)", [username, password , role], function (err) {
                if (err) {
                    console.error("Error inserting user:", err);
                    return response.render('register', { error: "Username already taken!" });
                }

				console.log("User successfully registered:", username);
                response.redirect('/login'); // Redirect to login page after successful registration
            });
        });
    }
};

exports.login = function (request, response) {
    if (request.method === "GET") {
        response.render('login', { title: "User Login" });
    } else if (request.method === "POST") {
        let body = '';

        // Collect POST data (login credentials)
        request.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });

        request.on('end', () => {
            let params = new URLSearchParams(body);
            let username = params.get('username');
            let password = params.get('password');

            // Check if username and password were provided
            if (!username || !password) {
                return response.render('login', { error: "Both username and password are required!" });
            }

            // Query the database for matching credentials
            db.get("SELECT userid, password, role,id FROM users WHERE userid = ? AND password = ?", 
                [username, password], 
                function (err, row) {
                    if (err) {
                        console.error("Database error:", err);
                        return response.render('login', { error: "Internal Server Error. Please try again later." });
                    }

                    // If credentials are incorrect
                    if (!row) {
                        return response.render('login', { error: "Incorrect username or password." });
                    }

                    userID=row.id;
                    userRole=row.role;

                    console.log(userRole);

                    // If credentials are correct, store login info temporarily in memory
                    
                    console.log(`User ${username} logged in.`);

                    loggedIn=true;
                    // Redirect to songs after successful login
                    response.redirect('/songs?role=' + userRole);
                    console.log("YOU ARE AUTHENTICATED")
                });
        });
    }
};

exports.users = function(request, response){
        // users.html
		db.all("SELECT userid, password, role FROM users", function(err, rows){
           if (err) return response.status(500).send("DB error");
 	       response.render('users', {title : 'Users:', userEntries: rows , role:userRole});
		})
}

exports.playlist = function(request, response) {
    // Check if user is logged in
    if (!loggedIn) {
        return response.redirect('/login');  // Redirect to login if not authenticated
    }

    // Query the database to retrieve the songs in the user's playlist.
    // You may need to join with the songs table to get song details.
    const query = "SELECT * FROM playlist WHERE user_id = ?";
    db.all(query, [userID], (err, rows) => {
        if (err) {
            console.error(err);
            return response.status(500).send("Database error");
        }

        response.render('playlist', { playlist: rows, role: userRole });
    });
};

exports.addSongToPlaylist = function(request,response){
    const { title, artist, artworkUrl } = request.query;

    if (!loggedIn || !userID) {
      return response.json({ success: false, error: 'Not logged in' });
    }
  
    const query = "INSERT INTO playlist (user_id, song_title, artist_name, artwork_url) VALUES (?, ?, ?, ?)";
    db.run(query, [userID, title, artist, artworkUrl], function(err) {
      if (err) return response.json({ success: false, error: err.message });
      response.json({ success: true });
    });
}

exports.removeSongFromPlaylist = function(req,res){
    const { song_title, artist_name } = req.query;
    console.log(req.query);
    console.log(artist_name);

    if (!song_title || !artist_name) {
        return res.status(400).send('Song title and artist name are required.');
    }

    const sql = 'DELETE FROM playlist WHERE song_title = ? AND artist_name = ?';

    db.run(sql, [song_title, artist_name], function (err) {
        if (err) {
            console.error('Error removing song from playlist:', err.message);
            return res.status(500).send('Failed to remove song from playlist.');
        } else {
            console.log(`Removed song from playlist: ${song_title} by ${artist_name}`);
            return res.redirect('/songs/playlist'); // Redirect to the playlist page
        }
    });
}

exports.removeUser = function(req,res){
    const userid = req.query.userid;

    if (!userid ) {
        return res.status(400).send('Song title and artist name are required.');
    }

    const sql = 'DELETE FROM users WHERE userid = ? AND role="guest"';

    db.run(sql, [userid], function (err) {
        if (err) {
            console.error('Error removing user:', err.message);
            return res.status(500).send('Failed to remove user.');
        } else {
            console.log(`Removed user from users: ${userid}`);
            return res.redirect('/users'); // Redirect to the users page
        }
    });
}