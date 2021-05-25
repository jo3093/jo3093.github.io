/* global L */
// Bike Trail Tirol Beispiel

// Kartenhintergründe der basemap.at definieren
let baselayers = {
    standard: L.tileLayer.provider("BasemapAT.basemap"),
    grau: L.tileLayer.provider("BasemapAT.grau"),
    terrain: L.tileLayer.provider("BasemapAT.terrain"),
    surface: L.tileLayer.provider("BasemapAT.surface"),
    highdpi: L.tileLayer.provider("BasemapAT.highdpi"),
    ortho_overlay: L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ]),
};

// Overlays für die Themen zum Ein- und Ausschalten definieren
let overlays = {
    tracks: L.featureGroup()
};

// Karte initialisieren und auf Innsbrucks Wikipedia Koordinate blicken
let map = L.map("map", {
    fullscreenControl: true,
    center: [47.267222, 11.392778],
    zoom: 9,
    layers: [
        baselayers.grau
    ]
})
// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "GPX-Tracks": overlays.tracks
}).addTo(map);

// Overlay mit GPX-Track anzeigen
overlays.tracks.addTo(map);

// Profile Control
const elevationControl = L.control.elevation({
    elevationDiv: '#profile',
    followMarker: false,                                    // Kartenausschnitt geht nicht mit 
    theme: 'lime-theme',
}).addTo(map)

// Funktion zum Track zeichnen mit Nummer als Parameter mit L.GPX Plugin
const drawTrack = (nr) => {
    let gpxTrack = new L.GPX(`tracks/${nr}.gpx`, {
        async: true,                                            // wartet bis gesamte Datei geladen ist
        marker_options: {                                       // Marker für Linie (siehe docu github)
            startIconUrl: `icons/number_${nr}.png`,
            endIconUrl: 'icons/finish.png',
            shadowUrl: null,
        },
        polyline_options: {                                     // Linie formatieren
            color: 'black',
            dashArray: [2, 5],
        }                                        
    }).addTo(overlays.tracks);
    gpxTrack.on("loaded", () => {                               // um auf Ereigniss (wenn vollständig geladen) reagieren
        console.log('loaded gpx');
        map.fitBounds(gpxTrack.getBounds());                      // Kartenausschnitt auf gpx-Track ausrichten/zoomen
        // PopUp
        gpxTrack.bindPopup(`
        <h4>${gpxTrack.get_name()}</h4>
        <ul>
            <li>Niedrigster Punkt: ${Math.round(gpxTrack.get_elevation_min())} m</li>
            <li>Höchster Punkt: ${Math.round(gpxTrack.get_elevation_max())} m</li>
            <li>Distanz: ${(gpxTrack.get_distance()/1000).toFixed(2)} km</li>
            <li>Höhenmeter bergauf: ${Math.round(gpxTrack.get_elevation_gain())} m</li>
            <li>Höhenmeter bergab: ${Math.round(gpxTrack.get_elevation_loss())} m</li>
        </ul>
         `)                                             
    });
    elevationControl.load(`tracks/${nr}.gpx`);
};

const selectedTrack = 12;
drawTrack(selectedTrack);