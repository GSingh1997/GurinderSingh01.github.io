


/********** get tracks ***************/


const tracksTemplateSource = document.getElementById('tracks-template').innerHTML;
const tracksTemplate = Handlebars.compile(tracksTemplateSource);

const $tracks = $('#tracks-container');

const getTopTracks = $.get('https://api.napster.com/v2.1/tracks/top?apikey=ZTk2YjY4MjMtMDAzYy00MTg4LWE2MjYtZDIzNjJmMmM0YTdm');

getTopTracks
    .then((response) => {
        $tracks.html(tracksTemplate(response));
    });

/***************** IndexedDB CODE **************/

let info = {artist:"",track:""};
const indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
let db;

function initDb() {
    const request = indexedDB.open("trackRepo", 1);
    request.onsuccess = function () {
        db = request.result;
    };
    request.onerror = function (evt) {
        console.log("IndexedDB error: " + evt.target.errorCode);
    };
    request.onupgradeneeded = function (evt) {
        let objectStore = evt.currentTarget.result.createObjectStore(
            "tracks", {keyPath: "id", autoIncrement: true});
        let puntee = [
            {artist: "Post Malone", track: "phsyco"},
            {artist: "Kendrick Lamar", track: "Humble"}];
        for (i in puntee) {
            objectStore.add(puntee[i]);
            console.log("e")
        }
    };


}

function saveToDB() {


 alert("button event");
     var artistName = $(this).parent().find("#artistName").text();
     var trackName = $(this).parent().find("#trackName").text();
    info.artist = artistName;
    info.track = trackName;
        var transaction = db.transaction("tracks", "readwrite");
        var objectStore = transaction.objectStore("tracks");
        var request = objectStore.add(info);
    request.onsuccess = function(e){console.log("added new data")};
        request.onerror = function (e) {
            console.log("failed saving" + e);

    }
}

function loadDataDB() {
    let transaction = db.transaction("cars", "readonly");
    let objectStore = transaction.objectStore("cars");
    let request = objectStore.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;
        if (cursor) {
            maakPunt(cursor.value);
            cursor.continue();
        }
    };
    request.onerror = function (e) {
        console.log("failed loading "+e);
    };
}
$(document).ready(function () {

    initDb();

    if('serviceWorker' in navigator){
        try {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('./sw.js',{scope: './'});
            });
        }
        catch (error){
            console.log('failed')
        }
    }


    $("body").on("click","button",saveToDB)
});




/**




 * Created by gurin on 13/04/2018.
 */
