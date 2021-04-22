// Leaflet-provider Basemap laden
// https://leafletjs.com/reference-1.6.0.html#tilelayer
let basemapGray = L.tileLayer.provider('BasemapAT.grau');       // als string Name

// Karte erzeugen
// https://leafletjs.com/reference-1.7.1.html#map
let map = L.map("map", {                // id von html-Element und Options-Element {} für weitere Einstellung
    center: [47, 11],                   // Kartenzentrum
    zoom: 9,                            // Zoomlevel
    layers: [                           // Layers als Array
        basemapGray
    ]
}) 


// Overlays Objekt
// https://leafletjs.com/reference-1.7.1.html#featuregroup
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    windirection: L.featureGroup()
};

// LayerControl Objekt erzeugen um verschiedenen Layers ein-/ausschalten
// https://leafletjs.com/reference-1.7.1.html#control-layers
// https://leafletjs.com/reference-1.6.0.html#layergroup
let LayerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,                                          // key angezeigte Name
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.basemap": L.tileLayer.provider('BasemapAT.basemap'),
    "BasemapAT.terrain": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT.overlay+ortho": L.layerGroup ([                              // mehrere Layer kombinieren in LayerGroup
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])                              
}, {
    "Wetterstationen Tirol": overlays.stations,
    "Lufttemperatur [°C]": overlays.temperature,
    "Schneehöhe [cm]": overlays.snowheight,
    "Windgeschwindigkeit [m/s]": overlays.windspeed,
    "Windrichtung": overlays.windirection
}).addTo(map);
overlays.temperature.addTo(map);




// Wetterstationsdaten einbinden
let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';


// Daten holen...
fetch(awsURL)                                       // Anfrage auf Sever
    .then(answer => answer.json())                  // wenn ok => Daten laden und in json konvertieren 
    .then(json => {                                 // wenn ok => mit dem json-Objekt in nächsten Funktion weiterarbeiten
        for (station of json.features) {            // für jeden Eintrag in json.features = station (je Objekt mit geometry, properties, ...):
            // https://leafletjs.com/reference-1.6.0.html#marker
            let marker = L.marker([                 // wird ein Marker erstellt
                station.geometry.coordinates[1],        // lat
                station.geometry.coordinates[0]         // long                                       
                                                        
            ]).addTo(overlays.stations);                     // nicht direkt zu map hinzufügen sondern zum awsLayer

            // Für Pop-up Datum formatieren - JavaScript-Datumsobjekt erzeugen
            let formattedDate = new Date(station.properties.date);

            // Pop-up erstellen und befüllen (html) wenn wert nicht gibt (undefined) dann ?
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                    <li>Seehöhe: ${station.geometry.coordinates[2]} m</li>       
                    <li>Lufttemperatur: ${station.properties.LT || '?'} C</li>                  
                    <li>Schneehöhe: ${station.properties.HS || '?'} cm</li>
                    <li>Relative Luftfeuchtigkeit: ${station.properties.RH || '?'} %</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} m/s</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
                `);

            // Marker für Schneehöhen
            if (station.properties.HS != undefined &&  station.properties.HS >= 0) {                // wenn Schneehöhe vorhanden 
                let highlightSnowClass = '';            // Variable mit leerem String (defautl) um je nach Schneehöhe andere css-Klasse hinzufügen für unter. Formatierung
                if (station.properties.HS < 1) {
                    highlightSnowClass = 'snow-1';
                } else if (station.properties.HS < 10) {
                    highlightSnowClass = 'snow-2';
                } else if (station.properties.HS < 25) {
                    highlightSnowClass = 'snow-3';
                } else if (station.properties.HS < 50) {
                    highlightSnowClass = 'snow-4';
                } else if (station.properties.HS < 100) {
                    highlightSnowClass = 'snow-5';
                } else if (station.properties.HS < 200) {
                    highlightSnowClass = 'snow-6';
                } else if (station.properties.HS < 300) {
                    highlightSnowClass = 'snow-7';
                } else {
                    highlightSnowClass = 'snow-8';
                } 
                // https://leafletjs.com/reference-1.6.0.html#divicon
                let snowIcon = L.divIcon({              // Icon erzeugen (div von html um die Höhe reinzuschreiben mit css-Klasse für Formatierung)
                    html: `<div class="label-textMarker ${highlightSnowClass}">${station.properties.HS}</div>`
                });
                let snowMarker = L.marker([             // Marker erzeugen
                    station.geometry.coordinates[1],        // lat
                    station.geometry.coordinates[0]         // long
                ], {
                    icon: snowIcon                      // nach Koordinaten, Objekt mit weiteren Konfigurationen → Icon
                });
                snowMarker.addTo(overlays.snowheight);             // zum snowlayer hinzufügen
            };
            
            // Marker für Windstärke
            if (station.properties.WG) {                // wenn Windstärke vorhanden 
                let highlightWindClass = '';            // Variable mit leerem String (defautl) um je nach Windstärke andere css-Klasse hinzufügen für unter. Formatierung
                if(station.properties.WG > 10) {
                    highlightWindClass = 'wind-10';
                };
                if(station.properties.WG > 20) {
                    highlightWindClass = 'wind-20';
                };
                let windIcon = L.divIcon({              // Icon erzeugen (div von html um die Stärke reinzuschreiben mit css-Klasse für Formatierung)
                    html: `<div class="label-textMarker ${highlightWindClass}">${station.properties.WG}</div>`
                });
                let windMarker = L.marker([             // Marker erzeugen
                    station.geometry.coordinates[1],        // lat
                    station.geometry.coordinates[0]         // long
                ], {
                    icon: windIcon                      // nach Koordinaten, Objekt mit weiteren Konfigurationen → Icon
                });
                windMarker.addTo(overlays.windspeed);             // zum windlayer hinzufügen
            };

            // Marker für Lufttemperatur
            if (station.properties.LT != undefined) { // wenn Temperatur vorhanden (not undefined)
                let highlightTempClass = '';
                if(station.properties.LT > 0) {
                    highlightTempClass = 'positiv';
                };
                if(station.properties.LT < 0) {
                    highlightTempClass = 'negativ';
                };
                let tempIcon = L.divIcon({              // Icon erzeugen (div von html um die Stärke reinzuschreiben mit css-Klasse für Formatierung)
                    html: `<div class="label-textMarker ${highlightTempClass}">${station.properties.LT}</div>`
                });
                let tempMarker = L.marker([             // Marker erzeugen
                    station.geometry.coordinates[1],        // lat
                    station.geometry.coordinates[0]         // long
                ], {
                    icon: tempIcon                      // nach Koordinaten, Objekt mit weiteren Konfigurationen → Icon
                });
                tempMarker.addTo(overlays.temperature);            // zum templayer hinzufügen
            };

        };
    
        
        // Karte an Extent von awsLayer verschieben
        map.fitBounds(awsLayer.getBounds());

    });


              


 


