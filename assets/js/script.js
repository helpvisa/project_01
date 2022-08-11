//-----------------------
// variable declarations
//-----------------------

var apiTestString = "Pavement"; // test querying results using this string
var keyLastFM = "3e097c528fbffe98b64806d2fe264b7b";
var keyYoutube = "AIzaSyDtyonSH-2_xkCFFv7-WEpBHrro1tawGlI";


//-----------------------
// main body of code
//-----------------------

// test lastFM api
queryLastFM(apiTestString, 0);
queryLastFM(apiTestString, 1);
queryLastFM(apiTestString, 2);
queryLastFM(apiTestString, 3);

// test youtube API
searchYoutube(apiTestString);

//-----------------------
// function declarations
//-----------------------

// fetch results from the lastfm api (artist info, similar artists, top albums and tracks)
function queryLastFM(artist, mode) {
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
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
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
function searchYoutube(artist) {
    // encoding the artist names to remove spaces or special character with query string safe characters
    artist = encodeURI(artist);

    var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=" + artist + "&type=video&key=" + keyYoutube;

    // query the youtube API
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
                // ^ above returns array of found items; data.items[0].id.videoId is the video's youtube id
                // the videoId can be used to construct a URL as such:
                // "https://www.youtube.com/watch?v=" + videoId
            });
        } else {
            alert("No search results found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the YouTube API.");
    });
}