🎵 Songify Website
===================
Overview
--------------------
This web application allows users to search for songs using a public API (iTunes Search API), build their own playlist, and manage it through a simple user interface. It supports user authentication, different user roles, and content persistence.

The app is built using Node.js, Express, SQLite, and Handlebars templating engine. 

Features & Requirements
-----------------------
✅ R 1.1 – User Roles & Authentication (2 marks) : 
The app supports two types of users: "guest" and "admin".

Users must log in to access the playlist and song features.

Unauthorized users are redirected to the login or registration page.

Middleware ensures that protected routes are only accessible to logged-in users.

✅ R 1.2 – Guest Registration (2 marks)
Guests can register through the /register route.

Newly registered users are stored in the database as "guest" users and if they write the access code which is "2406" then they will register in as admin.

✅ R 1.3 – Admin User Management (2 marks)
The database is pre-populated with at least one "admin" user.

Admins can view a list of all registered users by accessing the /users route and can remove the users as well.

✅ R 1.4 – Public API Integration (2 marks)
The application uses the iTunes Search API to fetch song data dynamically.

Users can search by song title and view results directly within the app.

✅ R 1.5 – Single Page App Behavior (2 marks)

Users interact with the app through buttons and forms on a single main interface.

Only initial login/register routes load new pages; all interactions afterward remain in-page.

✅ R 1.6 – Template Rendering with Handlebars (2 marks)
The app uses Handlebars (.hbs) for server-side template rendering.

Pages such as login, register, playlist, and user views are rendered with templates that dynamically insert database or API content.

✅ R 1.7 – User-Contributed Content (2 marks)
Users can add songs to their personal playlist, which is stored in the database.

Users can remove songs from their playlist as well.

Playlists are persistent — content is saved per user and retained across sessions.

===========================================================================================

INSTALL INSTRUCTIONS:
---------------------
npm install 

LAUNCH INSTRUCTIONS:
--------------------
To launch the app, execute the following command in your terminal go to specific problem and do:
> node server.js

TESTING INSTRUCTIONS:
---------------------
Problem 3:
http://localhost:3000/login

VIDEO DEMONSTRATION:
---------------------
Here is the YouTube link to my demonstration 
https://youtu.be/rJSyEW3JCF4
