
$(document).ready(function () {
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
});
const tracksTemplateSource = document.getElementById('tracks-template').innerHTML;
const tracksTemplate = Handlebars.compile(tracksTemplateSource);

const $tracks = $('#tracks-container');

const getTopTracks = $.get('https://api.napster.com/v2.1/tracks/top?apikey=ZTk2YjY4MjMtMDAzYy00MTg4LWE2MjYtZDIzNjJmMmM0YTdm');

getTopTracks
    .then((response) => {
console.log(response);
        $tracks.html(tracksTemplate(response));
    });/**
 * Created by gurin on 13/04/2018.
 */
