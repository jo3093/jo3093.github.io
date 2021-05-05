// OGD-Wien Beispiel

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
    busLines: L.featureGroup(),
    busStops: L.featureGroup(),
    pedAreas: L.featureGroup()
};

// Karte initialisieren und auf Wiens Wikipedia Koordinate blicken
let map = L.map("map", {
    center: [48.208333, 16.373056],
    zoom: 13,
    layers: [
        baselayers.grau
    ]
});

// Kartenhintergründe und Overlays zur Layer-Control hinzufügen
let layerControl = L.control.layers({
    "basemap.at Standard": baselayers.standard,
    "basemap.at grau": baselayers.grau,
    "basemap.at Relief": baselayers.terrain,
    "basemap.at Oberfläche": baselayers.surface,
    "basemap.at hochauflösend": baselayers.highdpi,
    "basemap.at Orthofoto beschriftet": baselayers.ortho_overlay
}, {
    "Liniennetz Vienna Sightseeing": overlays.busLines,
    "Haltestellen Vienna Sightseeing": overlays.busStops,
    "Fußgängerzonen": overlays.pedAreas
}).addTo(map);

// alle Overlays nach dem Laden anzeigen
overlays.busLines.addTo(map);
overlays.busStops.addTo(map);
overlays.pedAreas.addTo(map);

// Tourist-Haltestellen laden, zur Karte hinzufügen und Pop-up
fetch("data/TOURISTIKHTSVSLOGD.json")                           // statt URL Pfad zur Datei (lokal gespeichert)
    .then(response => response.json())                          // wenn erfolgreich geladen die Antwort = response in json-Format konvertieren
    .then(stations => {                                         // wenn erfolgreich Daten in Variable stations speichern
        L.geoJson(stations, {                                   // eigene Funktion fürs Anzeigen mit Leaflet. 1 Parameter Daten, 2 Parameter Objekt mit unter. Optionen
            onEachFeature: (feature, layer) => {                // onEachFeature = Funktion wird auf jedes Element des geoJson angewendet. 
                layer.bindPopup(feature.properties.STAT_NAME)   
            },
            pointToLayer: (geoJsonPoint, latlng) => {           // um eigenen Icon zu erzeugen
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: 'icons/busstop.png',
                        iconSize: [40, 40]
                    })
                })
            }
        }).addTo(map);     
    })