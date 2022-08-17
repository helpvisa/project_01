//-----------------------
// variable declarations
//-----------------------
var apiTestString = "Pavement"; // test querying results using this string
var keyLastFM = "3e097c528fbffe98b64806d2fe264b7b";
var keyYoutube = "AIzaSyDtyonSH-2_xkCFFv7-WEpBHrro1tawGlI";
var isSearching = false // check if the user is searching for a track and prevent new searches

// header styles
var headerPreSearch = "hero is-flex is-flex-direction-column is-align-items-center horizontal-align"
var headerPostSearch = "has-background-grey-lighter is-flex is-flex-direction-column is-align-items-center"
var loadBar = `<div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>
                <div class="wave"></div>`

var searchedArtistHTML = `<div class="hero-body is-flex is-flex-direction-column is-align-items-center">
                           <p class="title is-size-3-mobile">
                                <!-- Artist Name -->
                            </p>
                            <p class="subtitle">
                                <!-- Description -->
                            </p>
                        </div>`

// mode for lastFM query
var modeQuery = {
    getInfo:0,
    getSimilar:1,
    getTopAlbums:2,
    getTopTracks:3
}

var numberOfRecommendations = 5; // number of artist recommendations to make after retrieving the list of artists (0-100);

//-----------------------
// acquire / query page elements
//-----------------------

var mainBodyEl = $("#main-body");
var searchFormEl = $("#search-form");
var searchInputEl = $("#search-input");
var headerEl = $("#landing");
var loadingEl = $("#loading");
var headerErrorMessageEl = $("#header-error-message");
var invalidEntryEl = $("<p>");
invalidEntryEl.addClass("has-text-danger");

//-----------------------
// main body of code
//-----------------------
// test findArtist function
//findArtist(apiTestString);

searchFormEl.on("submit", onSubmit);

//-----------------------
// function declarations
//-----------------------

// reset page
function resetPage(){
    // clear anything inside the main body from the previous searches
    mainBodyEl.html("");

    // clear any previous error message from an invalid search query
    headerErrorMessageEl.html("");

    // removes the loading animation from the page
    loadingEl.html("");

    // if a search is made once and then you make a blank search as the next search, the 
    // page will go back to the landing page default
    if(!headerEl.hasClass("vertical-align")){
        headerEl.addClass("vertical-align");
    }
}

// show error message
function showErrorMessage(message){
    invalidEntryEl.text(message);
    headerErrorMessageEl.append(invalidEntryEl);
}

// process page interactions
function onSubmit(event) {
    event.preventDefault();

    // prevent future searches
    if (!isSearching) {                     

        resetPage();

        // get inputted user value
        var search = searchInputEl.val().trim();
        
        if (search) {
            isSearching = true;

            // moves the search bar from the center of the page to the top of the page
            headerEl.removeClass("vertical-align");

            // show loading page
            loadingEl.html(loadBar);
            loadingEl.addClass("center load");

            // start API search
            findArtist(search);
            searchInputEl.val("");
        } else {
            
            // If the user does not enter a value in the search box and then presses enter, then "Invalid entry" will 
            // appear below the search box            
            showErrorMessage("Invalid name");

        }
    }
    else {
        console.log("searching already!");
    }
}

//---api functions---//
// fetch results from the lastfm api (artist info, similar artists, top albums and tracks)
async function queryLastFM(artist, mode) { // returns data object
    // what part of the api do you want to query?
    // options are:
    // 0. getinfo
    // 1. getsimilar
    // 2. gettopalbums
    // 3. gettoptracks
    // if none of these are provided, api will always return getinfo
    var url;
    // encoding the artist names to remove spaces or special character with query string safe characters
    artist = encodeURI(artist);
    // construct url based on which part of the api you have selected to query
    switch (mode) {
        case 0:
            url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artist + "&api_key=" + keyLastFM + "&format=json";
            break;
        case 1:
            url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artist + "&api_key=" + keyLastFM + "&format=json";
            break;
        case 2:
            url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=" + artist + "&api_key=" + keyLastFM + "&format=json";
            break;
        case 3:
            url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + artist + "&api_key=" + keyLastFM + "&format=json";
            break;
        default:
            url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artist + "&api_key=" + keyLastFM + "&format=json";
            break;
    }
    // perform api call
    return fetch(url).then(function(response) { // returns promise
        if (response.ok) {
            return response.json().then(function(data) {
                return data;
            });
        } else {
            resetPage();
            showErrorMessage("Unable to retrieve data from LastFM");
        }
    }).catch(function(error) {
        // error fetching api data
        resetPage();
        showErrorMessage("Could not connect to the LastFM API")
    });
}

// do a search with the youtube API
async function searchYoutube(artist) { // returns data object
    // encoding the artist names to remove spaces or special character with query string safe characters
    artist = encodeURI(artist);

    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=" + artist + "&type=video&key=" + keyYoutube;

    // query the youtube API; return this promise
    return fetch(url).then(function(response) {
        if (response.ok) {
            return response.json().then(function(data) {
                return data;
                // ^ above returns array of found items; data.items[0].id.videoId is the video's youtube id
                // the videoId can be used to construct a URL as such:
                // "https://www.youtube.com/watch?v=" + videoId;
                // or an embed as such:
                // "https://www.youtube.com/embed/" + videoId;
            });
        } else {
            resetPage();
            showErrorMessage("Unable to retrieve data from YouTube API");
        }
    }).catch(function(error) {
        // error fetching api data
        resetPage();
        showErrorMessage("Could not connect to the YouTube API");
    });
}

//---sorting functions---//
// sorts given array of artists by amount of listeners
async function sortSimilarArtists(similar) {
    var artistArray = [];
    for (i = 0; i < similar.length; i++) {
        var name = similar[i].name;
        // fetch artist data from name
        var response = await queryLastFM(name, modeQuery.getInfo); // await a response (pause code until one is received)
        var artist = await response.artist; // assign the artist from the return json response
        artistArray.push(artist); // add it to the array of similar artists
    }
    
    // now sort the array of similar artists, from least to most listeners, and return it
    artistArray.sort(compareListeners);
    return artistArray;
}

// sort algo
// given an array of artists, will sort them from lowest to highest listeners
function compareListeners(a, b) {
    if (a.stats.listeners > b.stats.listeners)
        return 1;
    if (a.stats.listeners < b.stats.listeners)
        return -1;
    return 0;
}

//---assembly functions---//
// function which performs the bulk of the main code executed upon entering an artist search
async function findArtist(search) {
    queryLastFM(search, 1).then(function (data) {
        // data has a message fiels that means the user specified aritist name does not exist
         if(data.message){
            // resets the page to show the landing page
            resetPage();

            // shows the error message on the screen for the user to see
            showErrorMessage(data.message)

            isSearching = false;
         }else{
            sortSimilarArtists(data.similarartists.artist).then(function (artists) {
                var promiseArray = []
                for (var i = 0; i < numberOfRecommendations; i++) {
                    var searchedArtist = artists[i].name;
                    promiseArray.push(queryLastFM(searchedArtist, 3))
                }
                Promise.all(promiseArray).then(function (tracks) {
                    // test output
                    //console.log(data.similarartists.artist);
                    
                    // remove the loadbar
                    loadingEl.html("");
                    loadingEl.removeClass("center load");                
    
                    // add searched artist info section
                    var searchedArtistEl = $("<section>");
                    searchedArtistEl.addClass("hero has-background-info");
                    // build container div
                    var searchedArtistDivEl = $("<div>");
                    searchedArtistDivEl.addClass("hero-body is-flex is-flex-direction-column is-align-items-center");
                    // build artist name
                    var searchedArtistNameEl = $("<p>");
                    searchedArtistNameEl.addClass("title is-size-3-mobile");
                    searchedArtistNameEl.text(data.similarartists["@attr"].artist);
                    // build artist description (nest another query)
                    var searchedArtistDescriptionEl = $("<p>");
                    searchedArtistDescriptionEl.addClass("subtitle");
                    searchedArtistDescriptionEl.text("lorem ipsum lorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsumlorem ipsum");
                    // append to section and div
                    searchedArtistDivEl.append(searchedArtistNameEl, searchedArtistDescriptionEl);
                    searchedArtistEl.append(searchedArtistDivEl);
                    // append to main body
                    mainBodyEl.append(searchedArtistEl);
    
                    // add recommendations sections
                    var recEl = $("<section>");
                    recEl.addClass("has-background-grey-lighter pt-5 columns tile is-ancestor is-flex is-flex-direction-column is-align-items-center");
                    // build header
                    var recHeaderEl = $("<h2>");
                    recHeaderEl.addClass("title is-size-4-mobile");
                    recHeaderEl.text("Similar Artists");
                    // add to section, then body
                    recEl.append(recHeaderEl);
                    mainBodyEl.append(recEl);
    
                    for (var i = 0; i < tracks.length; i++) {
                        if (tracks[i].toptracks.track[0]) {
                            var topTrack = tracks[i].toptracks.track[0].name
    
                            // assemble a youtube search string of toptrack + artist name
                            var searchString = topTrack + " " + artists[i].name + " song";
    
                            // search youtube and get top video results
                            
                            // searchYoutube(searchString).then(function (videos) {
                            //     // print video link to console
                            //     console.log("https://www.youtube.com/watch?v=" + videos.items[0].id.videoId);
                            // });
                            
                            // test output
                            // console.log("oh i found a video: " + topTrack);
    
                            // construct card displaying similar artist + track
                            var cardEl = $("<div>");
                            cardEl.addClass("card column is-parent is-full-mobile is-4-tablet mb-5");
                            // build card body
                            var cardBodyEl = $("<div>");
                            cardBodyEl.addClass("card-image tile is-child box notification is-info box");
                            // header info
                            var titleEl = $("<p>");
                            titleEl.addClass("title");
                            titleEl.text(artists[i].name);
                            // media element
                            var mediaEl = $("<figure>");
                            mediaEl.addClass("image is-4by3");
                            mediaEl.html("<img src='https://bulma.io/images/placeholders/1280x960.png' alt='Placeholder image'>");
                            // append to card
                            cardBodyEl.append(titleEl, mediaEl);
                            cardEl.append(cardBodyEl);
                            // append card to section
                            recEl.append(cardEl);
                        }
                    }
                    // reset and allow user to search again
                    isSearching = false;
                });
            });
         }
        
    });
}