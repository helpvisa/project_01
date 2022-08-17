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

//-----------------------
// main body of code
//-----------------------
// test findArtist function
//findArtist(apiTestString);

searchFormEl.on("submit", onSubmit);

//-----------------------
// function declarations
//-----------------------
// process page interactions
function onSubmit(event) {
    event.preventDefault();

    // prevent future searches
    if (!isSearching) {
        isSearching = true;

        headerEl.removeClass("vertical-align");
        loadingEl.html(loadBar);
        loadingEl.addClass("center load");

        // get inputted user value
        var search = searchInputEl.val().trim();

        if (search) {
            findArtist(search);
            searchInputEl.val("");
        } else {
            // TEMP! this should not "ship"!
            searchInputEl.value = ("Please enter an artist.");
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
            alert("No artist found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the LastFM API.");
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
            alert("No search results found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the YouTube API.");
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
        console.log(data);
        sortSimilarArtists(data.similarartists.artist).then(function (artists) {
            var promiseArray = []
            for (var i = 0; i < numberOfRecommendations; i++) {
                var searchedArtist = artists[i].name;
                promiseArray.push(queryLastFM(searchedArtist, 3))
            }
            Promise.all(promiseArray).then(function (tracks) {
                console.log(tracks);
                
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

                for (var i = 0; i < tracks.length; i++) {
                    if (tracks[i].toptracks.track[0]) {
                        var topTrack = tracks[i].toptracks.track[0].name

                        // assemble a youtube search string of toptrack + artist name
                        var searchString = topTrack + " " + artists[i].name + " song";

                        // search youtube and get top video results
                        /*
                        searchYoutube(searchString).then(function (videos) {
                            // print video link to console
                            console.log("https://www.youtube.com/watch?v=" + videos.items[0].id.videoId);
                        });
                        */
                       console.log("oh i found a video: " + topTrack);
                    }
                }
                // reset and allow user to search again
                isSearching = false;
            });
        });
    });
}