


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
            {artist: "Kendrick Lamar", track: "Humble"},
            {artist: "Eminem", track: "Lose yourself"},
            {artist: "Psy", track: "Gangam Style"},
            {artist: "Coldplay", track: "A Head full of Dreams"},
            {artist: "dua lipa", track: "Be The One"},
            {artist: "Ed Sheeran", track: "The A Team"}

        ];
        for (i in puntee) {
            objectStore.add(puntee[i]);
            console.log("e")
        }
    };


}

function saveToDB() {

alert("saving to indexedDB");

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

function renderFavSongs(data, dataKey){

    $("table tbody").append("   <tr><td>" +dataKey +"</td><td><a href='#'> <span class='glyphicon glyphicon-user'></span> </a>" + data.artist + "</td> <td><a href='#'> <span class='glyphicon glyphicon-triangle-right'></span> </a> " + data.track +"</td> <td><button type='button' class='deletebtn btn btn-default btn-sm' value='" +dataKey + "'> <span class='glyphicon glyphicon-remove'></span> Remove </button></td> </tr>")

}

function loadDataDB() {
    $("table tbody").empty();


    $("main").hide();
    $(".contact").hide();
    $("table").show();
    let transaction = db.transaction("tracks", "readonly");
    let objectStore = transaction.objectStore("tracks");
    let request = objectStore.openCursor();
    request.onsuccess = function (evt) {
        let cursor = evt.target.result;
        if (cursor) {
            renderFavSongs(cursor.value,cursor.key);
            cursor.continue();
        }
    };
    request.onerror = function (e) {
        console.log("failed loading "+e);
    };
}

function removeFromDB() {


    var transaction = db.transaction("tracks", "readwrite");
    var objectStore = transaction.objectStore("tracks");
    var id = parseInt($(this).val(), 10);
    console.log($(this).val());
   objectStore.delete( id);
    loadDataDB();
}


function showContactForm(){

    $("main").hide();
    $("table").hide();
    $(".contact").show();
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

    $("main").on("click","button",saveToDB);
    $("#favTracks").on("click",loadDataDB);
    $("#contact").on("click",showContactForm);
    $(document).on("click",".deletebtn",removeFromDB);
});




/**




 * Created by gurin on 13/04/2018.
 */
