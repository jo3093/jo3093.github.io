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
    pedAreas: L.featureGroup(),
    POI: L.featureGroup()
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
overlays.POI.addTo(map)

// // Tourist-Haltestellen laden, zur Karte hinzufügen und Pop-up
// fetch("data/TOURISTIKHTSVSLOGD.json")                           // statt URL Pfad zur Datei (lokal gespeichert)
//     .then(response => response.json())                          // wenn erfolgreich geladen die Antwort = response in json-Format konvertieren
//     .then(stations => {                                         // wenn erfolgreich Daten in Variable stations speichern
//         L.geoJson(stations, {                                   // eigene Funktion fürs Anzeigen mit Leaflet. 1 Parameter Daten, 2 Parameter Objekt mit unter. Optionen
//             onEachFeature: (feature, layer) => {                // onEachFeature = Funktion wird auf jedes Element des geoJson angewendet. 
//                 layer.bindPopup(feature.properties.STAT_NAME)   
//             },
//             pointToLayer: (geoJsonPoint, latlng) => {           // um eigenen Icon zu erzeugen
//                 return L.marker(latlng, {
//                     icon: L.icon({
//                         iconUrl: 'icons/busstop.png',
//                         iconSize: [40, 40]
//                     })
//                 })
//             }
//         }).addTo(map);     
//     })


// Funktionen
let drawBusStop = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`
            <strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            Station:${feature.properties.STAT_NAME}
            `);
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/busstop.png',
                    iconSize: [40, 40]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>, <a href="https://mapicons.mapsmarker.com">Maps Icons Collection</a>'
    }).addTo(overlays.busStops);
}

let drawBusLines = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`
            <strong>${feature.properties.LINE_NAME}</strong>
            <hr>
            von ${feature.properties.FROM_NAME}
            <br>
            nach ${feature.properties.TO_NAME}
            `);
        }, style: (feature) => {
            col = COLORS.buslines[feature.properties.LINE_NAME]
            // if (feature.properties.LINE_NAME == 'Blue Line') {
            //     col = COLORS.buslines["Blue Line"];
            // }
            // if (feature.properties.LINE_NAME == 'Yellow Line') {
            //     col = COLORS.buslines["Yellow Line"];
            // }
            return {
                color: col
            }
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.busLines);
}

let drawPedestrainAreas = (geoJsonData) => {
    L.geoJson(geoJsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`
            <strong>Fußgängerzone ${feature.properties.ADRESSE}</strong>
            <hr>
            ${feature.properties.ZEITRAUM || ""}
            <br>
            ${feature.properties.AUSN_TEXT || ""}
            `);
        },
        style: (feature) => {
           return {
               stroke: true,
               color: "silver",
               fillColor: "yellow",
               fillOpacity: 0.3
           }  
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.pedAreas)
}

let drawPOIs = (geojsonData) => {
    L.geoJson(geojsonData, {
        onEachFeature: (feature, layer) => {
            layer.bindPopup(`
            <strong>${feature.properties.NAME}</strong>
            <hr>
            ${feature.properties.ADRESSE}
            <br>
            <img src="${feature.properties.THUMBNAIL}" alt="image description"/>
            <a href="${feature.properties.WEITERE_INF}">Weitere Infos</a>
            `);
        },
        pointToLayer: (geoJsonPoint, latlng) => {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: 'icons/sehenswuerdigogd.png',
                    iconSize: [27, 27]
                })
            })
        },
        attribution: '<a href="https://data.wien.gv.at">Stadt Wien</a>'
    }).addTo(overlays.POI);
}



// Schleife für alle Datensätze - je nach Title führ eigene Funktion um Icon und Pop-up zu erstellen
for (let config of OGDWIEN) {
    fetch(config.data)
        .then(response => response.json())
        .then(geojsonData => {
            if (config.title == "Haltestellen Vienna Sightseeing") {
                drawBusStop(geojsonData);
            } else if (config.title == "Liniennetz Vienna Sightseeing") {
                drawBusLines(geojsonData);
            } else if (config.title == "Fußgängerzonen") {
                drawPedestrainAreas(geojsonData);
            } else if (config.title == "Sehenswürdigkeiten") {
                drawPOIs(geojsonData);
            }
        })

}