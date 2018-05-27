/**
 * Created by gurin on 13/04/2018.
 */

const cacheFiles = [
    './',
    './index.html',
    './manifest.json',
    './screen.css',
    './images/icons/icon-72x72.png',
    './images/icons/icon-96x96.png',
    './images/icons/icon-128x128.png',
    './images/icons/icon-144x144.png',
    './images/icons/icon-152x152.png',
    'https://code.jquery.com/jquery-1.10.1.min.js',
'https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/2.0.0-alpha.1/handlebars.min.js'];

const CURRENT_CACHES = 'v3';


self.addEventListener('install',function (e) {
e.waitUntil(
    caches.open(CURRENT_CACHES).then(function(cache){
        console.log("ServiceWorker Caching cache files")
        return cache.addAll(cacheFiles)
    })
)
});

self.addEventListener('activate', function(event) {
    // Delete all caches that aren't named in CURRENT_CACHES.
    // While there is only one cache in this example, the same logic will handle the case where
    // there are multiple versioned caches.
    var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        // If this cache name isn't present in the array of "expected" cache names, then delete it.
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    console.log('Handling fetch event for', event.request.url);

    if (event.request.headers.get('range')) {
        var pos =
            Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
        console.log('Range request for', event.request.url,
            ', starting position:', pos);
        event.respondWith(
            caches.open(CURRENT_CACHES.prefetch)
                .then(function(cache) {
                    return cache.match(event.request.url);
                }).then(function(res) {
                if (!res) {
                    return fetch(event.request)
                        .then(res => {
                            return res.arrayBuffer();
                        });
                }
                return res.arrayBuffer();
            }).then(function(ab) {
                return new Response(
                    ab.slice(pos),
                    {
                        status: 206,
                        statusText: 'Partial Content',
                        headers: [
                            // ['Content-Type', 'video/webm'],
                            ['Content-Range', 'bytes ' + pos + '-' +
                            (ab.byteLength - 1) + '/' + ab.byteLength]]
                    });
            }));
    } else {
        console.log('Non-range request for', event.request.url);
        event.respondWith(
            // caches.match() will look for a cache entry in all of the caches available to the service worker.
            // It's an alternative to first opening a specific named cache and then matching on that.
            caches.match(event.request).then(function(response) {
                if (response) {
                    console.log('Found response in cache:', response);
                    return response;
                }
                console.log('No response found in cache. About to fetch from network...');
                // event.request will always have the proper mode set ('cors, 'no-cors', etc.) so we don't
                // have to hardcode 'no-cors' like we do when fetch()ing in the install handler.
                return fetch(event.request).then(function(response) {
                    console.log('Response from network is:', response);

                    return response;
                }).catch(function(error) {
                    // This catch() will handle exceptions thrown from the fetch() operation.
                    // Note that a HTTP error response (e.g. 404) will NOT trigger an exception.
                    // It will return a normal response object that has the appropriate error code set.
                    console.error('Fetching failed:', error);

                    throw error;
                });
            })
        );
    }
});

