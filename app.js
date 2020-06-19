// **************************************************************************************************

// READ THIS FIRST

// 1. home.ejs is like a landing page with constant non changing links
// 2. top rated.ejs will use top rated api
// 3. search will use find api
// 4. sign in using local method or FB/Google oauth
// 5. each movie info is rendered on show.ejs
// 6. show.ejs has user review section
// 7. each user should have a watchlist(functioning like a todo list)
// 8. DATA COLLECTIONs :
//     - Schema for each movie/show to store comments and reviews
//     - UserSchema for storing user information
//     - UserSchema has subschema of ListSchema for watchlist

//uncomment for better reading

// **************************************************************************************************
//var show = {"id":"/title/tt0944947/","title":{"@type":"imdb.api.title.title","id":"/title/tt0944947/","image":{"height":1500,"id":"/title/tt0944947/images/rm4204167425","url":"https://m.media-amazon.com/images/M/MV5BYTRiNDQwYzAtMzVlZS00NTI5LWJjYjUtMzkwNTUzMWMxZTllXkEyXkFqcGdeQXVyNDIzMzcwNjc@._V1_.jpg","width":1102},"runningTimeInMinutes":57,"nextEpisode":"/title/tt1480055/","numberOfEpisodes":73,"seriesEndYear":2019,"seriesStartYear":2011,"title":"Game of ////Thrones","titleType":"tvSeries","year":2011},"certificates":{"US":[{"certificate":"TV-MA","country":"US"}]},"ratings":{"canRate":true,"rating":9.3,"ratingCount":1683189,"otherRanks":[{"id":"/chart/ratings/toptv","label":"Top 250 TV","rank":10,"rankType":"topTv"}]},"genres":["Action","Adventure","Drama","Fantasy","Romance"],"releaseDate":"2011-04-17","plotOutline":{"author":"GypsyKing878 and Brian McInnis","id":"/title/tt0944947/plot/po2596634","text":"Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia."},"plotSummary":{"author":"Sam Gray","id":"/title/tt0944947/plot/ps2733843","text":"In the mythical continent of Westeros, several powerful families fight for control of the Seven Kingdoms. As conflict erupts in the kingdoms of men, an ancient enemy rises once again to threaten them all. Meanwhile, the last heirs of a recently usurped dynasty plot to take back their homeland from across the Narrow Sea."}}

var writers = [
  {
    id: '/name/nm1125275/',
    image: {
      height: 2048,
      id: '/name/nm1125275/images/rm3011163648',
      url: 'https://m.media-amazon.com/images/M/MV5BMTAzNjQzMTEzMzJeQTJeQWpwZ15BbWU3MDkxNjA4NDc@._V1_.jpg',
      width: 1385
    },
    legacyNameText: 'Benioff, David',
    name: 'David Benioff',
    attr: [ 'creator' ],
    category: 'writer',
    endYear: 2019,
    episodeCount: 73,
    job: 'creator',
    startYear: 2011
  },
  {
    akas: [ 'Dan Weiss' ],
    disambiguation: 'II',
    id: '/name/nm1888967/',
    image: {
      height: 2048,
      id: '/name/nm1888967/images/rm2893723136',
      url: 'https://m.media-amazon.com/images/M/MV5BMTgxMjQzMTYxMF5BMl5BanBnXkFtZTcwOTA2MDg0Nw@@._V1_.jpg',
      width: 1439
    },
    legacyNameText: 'Weiss, D.B. (II)',
    name: 'D.B. Weiss',
    attr: [ 'creator' ],
    category: 'writer',
    endYear: 2019,
    episodeCount: 73,
    job: 'creator',
    startYear: 2011
  }
];
var directors = "DDD";


// *********************

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const getTconst = require(__dirname + "/get-id");
var request = require("request");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.get("/", function(req, res) {
  // res.send("hattbc");
  res.render("home");
});

app.get("/signin", function(req, res) {
  res.render("signin");
});

app.get("/toprated", function(req, res) {
  res.render("toprated");
});

let movieName = "";
app.get("/search", function(req, res) {
  if (movieName.length === 0) {
    res.write("<h1>Looks like you haven't searched for anything.</h1>");
    res.write("<p>Go back to search for a movie/show</p>");
    res.send();
  } else {
    var findTitle = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/find',
      qs: {
        currentCountry: 'US',
        q: movieName
      },
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5', //use own key
        useQueryString: true
      }
    }
    //Now I have to send these results to search.ejs
    request(findTitle, function(error, response, body) {
      if (error) throw new Error(error);
      const jsObj = JSON.parse(body);
      res.render("search", {results: jsObj.results});
    });
  }
});

app.get("/show/:id",function(req,res){

  //there are nested requests 1)for overall show 2)crew of show 3)user reviews

  // REQUEST FOR OVERVIEW
  var options = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-overview-details',
    qs: {currentCountry: 'US', tconst: req.params.id},
    headers: {
      'x-rapidapi-host': 'imdb8.p.rapidapi.com',
      'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5', //use own key
      useQueryString: true
    }
  };

  request(options, function (error, response, showX) {
  	if (error){
       throw new Error(error);
    }

    const show = JSON.parse(showX);
    //console.log(typeof(show));
    //console.log(show);
    const title = show.title.title;
    let url = "Some constant failsafe url";
    if(show.title.image){
      if(show.title.image.url){
        url = show.title.image.url
      }
    }
    const genres = show.genres;
    const titleType = show.title.titleType;
    const year = show.title.year;
    let synopsis = "Synopsis not added";
    let rating = "Not Rated";
    let summary = "Summary not added";
    if(show.plotOutline){
      synopsis = show.plotOutline.text;
    }
    if(show.ratings.canRate){
      rating = show.ratings.rating;
    }
    if(show.plotSummary){
      summary = show.plotSummary.text;;
    }

    //console.log(title,url,genres,titleType,year,synopsis,rating,summary);

    //REQUEST FOR CREW
    var crewGet = {
    method: 'GET',
    url: 'https://imdb8.p.rapidapi.com/title/get-top-crew',
    qs: {tconst: req.params.id},
    headers: {
      'x-rapidapi-host': 'imdb8.p.rapidapi.com',
      'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5',
      useQueryString: true
    }
  };

  request(crewGet, function (error, response, crewX) {
  	if (error) throw new Error(error);

    const crew = JSON.parse(crewX);
    let directors = "DDD" ;
    let writers = [];
  	if(titleType == "movie"){
      directors = crew.directors;
      writers = crew.writers;
    }
    else if(titleType == "tvSeries"){
      const writersMain = crew.writers;

      writersMain.forEach(function(writerx){
        if(writerx.job == "creator"){
          writers.push(writerx);
        }
      });
    }

    //REQUEST for REVIEWS
    var rev = {
      method: 'GET',
      url: 'https://imdb8.p.rapidapi.com/title/get-user-reviews',
      qs: {tconst: req.params.id},
      headers: {
        'x-rapidapi-host': 'imdb8.p.rapidapi.com',
        'x-rapidapi-key': '266ef19794msha90348685a1c992p155c55jsn7040d1b68eb5',
        useQueryString: true
      }
    };

    request(rev, function (error, response, revs) {
    	if (error) throw new Error(error);

      const reviewsX = JSON.parse(revs);
      const reviews = reviewsX.reviews;
      //console.log(reviewsX);

      res.render('show',{
        title : title,
        url : url,
        genres : genres,
        titleType : titleType,
        year : year,
        synopsis : synopsis,
        rating : rating,
        summary : summary,
        writers : writers,
        directors : directors,
        reviews : reviews
      });
    	//console.log(revs);
    });



  });

  });

  //Get writers and directors
  // const title = show.title.title;
  // const url = show.title.image.url;
  // const genres = show.genres;
  // const titleType = show.title.titleType;
  // const year = show.title.year;
  // let synopsis = "Synopsis not added";
  // let rating = "Not Rated";
  // let summary = "Summary not added";
  // if(show.plotOutline){
  //   synopsis = show.plotOutline.text;
  // }
  // if(show.ratings.canRate){
  //   rating = show.ratings.rating;
  // }
  // if(show.plotSummary){
  //   summary = show.plotSummary.text;;
  // }
  // res.render('show',{
  //   title : title,
  //   url : url,
  //   genres : genres,
  //   titleType : titleType,
  //   year : year,
  //   synopsis : synopsis,
  //   rating : rating,
  //   summary : summary,
  //   writers : writers,
  //   directors : directors
  // });
});

app.post("/updateWatchlist",function(req,res){

});

app.post("/search", function(req, res) {

  movieName = req.body.movieName;
  console.log(movieName);
  res.redirect("/search");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
