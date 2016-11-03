/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com

var express = require('express');
var accessToken;
var profileJson, heartJson, stepsJson;

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');
var path = require('path');
var fs = require('fs');
var session = require('express-session');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();



app.use(session({secret: 'test',
    saveUninitialized : true,
    resave : true}));

// initialize the Fitbit API client
var FitbitApiClient = require("fitbit-node"),
    client = new FitbitApiClient("227WZZ", "809c60db91c332b6f62c51934d630066");

// redirect the user to the Fitbit authorization page
app.get("/authorize", function (req, res) {
    // request access to the user's activity, heartrate, location, nutrion, profile, settings, sleep, social, and weight scopes
    res.redirect(client.getAuthorizeUrl('activity heartrate location nutrition profile settings sleep social weight', 'http://localhost:6001/call'));
});

// app.get("/out", function (req,res) {
//         res.redirect('/authorize');
// });

app.get('/out', function (req, res) {
    console.log('logout');
    //req.session.destroy();
    res.render('out');
});

app.get('/profile', function(req, res) {
   res.render('profile');
});

app.get('/heartrate', function(req, res) {
    res.render('heartrate');
});

app.get('/steps', function(req, res) {
    res.render('steps');
});

// handle the callback from the Fitbit authorization flow
app.get("/call", function (req, res) {
  console.log(req.query.code);
    // exchange the authorization code we just received for an access token

    //Getting Steps, Heart, Profile data
    client.getAccessToken(req.query.code, 'http://localhost:6001/call').then(function (result) {
        // use the access token to fetch the user's profile information
        accessToken = result.access_token;
        client.get("/profile.json", result.access_token).then(function (results) {
            //res.json(results[0]);

            var pd = JSON.stringify(results[0]);

            fs.writeFile(__dirname + '/public/profileJson.json', pd, function(err) {
                if (err) {
                    return console.error(err);
                }
            });


            // var age = JSON.stringify(results[0]['user']['age']);
            // var fullName = JSON.stringify(results[0]['user']['fullName']);
            // var height = JSON.stringify(results[0]['user']['height']);
            // var weight = JSON.stringify(results[0]['user']['weight']);
            // var averageDailySteps = JSON.stringify(results[0]['user']['averageDailySteps']);
            // var strideLengthRunning = JSON.stringify(results[0]['user']['strideLengthRunning']);
            // var strideLengthWalking = JSON.stringify(results[0]['user']['strideLengthWalking']);
            // var country = JSON.stringify(results[0]['user']['country']);
            //
            // profileJson =  {age: age, fullName: fullName, height: height, weight: weight, averageDailySteps: averageDailySteps,
            //     strideLengthRunning: strideLengthRunning, strideLengthWalking: strideLengthWalking, country: country};
            //res.render('ex',{profileData: profileJson});

            client.get("/activities/heart/date/today/7d.json", accessToken).then(function (resulth) {
                //res.send(results[0]);

                heartJson = JSON.stringify(resulth[0]['activities-heart']);

                fs.writeFile(__dirname + '/public/heartJson.json', heartJson, function(err) {
                    if (err) {
                        return console.error(err);
                    }
                });

                client.get("/activities/steps/date/today/7d.json", accessToken).then(function (resultst) {
                    //res.send(results[0]);

                    stepsJson = JSON.stringify(resultst[0]['activities-steps']);

                    fs.writeFile(__dirname + '/public/stepsJson.json', stepsJson, function(err) {
                        if (err) {
                            return console.error(err);
                        }
                    });

                    res.render('dashboard',{profileData: profileJson, heartData: heartJson, stepsData: stepsJson});

                });
            });
        });
    }).catch(function (error) {
        res.send(error);
    });
});




// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
