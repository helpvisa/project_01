//-----------------------
// variable declarations
//-----------------------

var apiTestString = "Pavement"; // test querying results using this string
var key = "3e097c528fbffe98b64806d2fe264b7b";


//-----------------------
// main body of code
//-----------------------

fetchArtistInfo(apiTestString);
fetchSimilarArtists(apiTestString);
fetchTopAlbums(apiTestString);
fetchTopTracks(apiTestString);

//-----------------------
// function declarations
//-----------------------

// fetch results from the lastfm api (artist info, similar artists, top albums and tracks)
function fetchArtistInfo(artist) {
    // construct url
    url = "http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=" + artist + "&api_key=" + key + "&format=json";
    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("No artist found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the LastFM API.");
    })
}

function fetchSimilarArtists(artist) {
    // construct url
    url = "http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&artist=" + artist + "&api_key=" + key + "&format=json";
    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("No artist found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the LastFM API.");
    })
}

function fetchTopAlbums(artist) {
    // construct url
    url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=" + artist + "&api_key=" + key + "&format=json";
    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("No artist found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the LastFM API.");
    })
}

function fetchTopTracks(artist) {
    // construct url
    url = "http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&artist=" + artist + "&api_key=" + key + "&format=json";
    // perform api call
    fetch(url).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log(data);
            })
        } else {
            alert("No artist found.");
        }
    }).catch(function(error) {
        // error fetching api data
        alert(error + " // Could not connect to the LastFM API.");
    })
}
