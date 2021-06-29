mapboxgl.accessToken = mapToken;
console.log(campground.geometry.coordinates)
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 15// starting zoom
});


map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl(),'top-left');


new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({
            offset:25
        })
        .setHTML(
            `<h5>${campground.title}</h5><p>${campground.location}</p>`
        )
        
    )
    .addTo(map)