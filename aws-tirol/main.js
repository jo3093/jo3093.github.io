// Leaflet-provider Basemap laden
let basemapGray = L.tileLayer.provider('BasemapAT.grau');       // als string Name

// Karte erzeugen
let map = L.map("map", {                // id von html-Element und Options-Element {} für weitere Einstellung
    center: [47, 11],                   // Kartenzentrum
    zoom: 9,                            // Zoomlevel
    layers: [                           // Layers als Array
        basemapGray
    ],
    fullscreenControl: true
}) 


// Overlays definieren  
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    humidity: L.featureGroup()
};


// LayerControl Objekt erzeugen um verschiedenen Layers ein-/ausschalten
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
    "Luftfeuchtigkeit [%]": overlays.humidity
}, {
    collapsed: false                                                          // automatisch ausgeklappt
}).addTo(map);

// Overlay Temperatur auto. eingeschaltet
overlays.temperature.addTo(map);


// Maßstab
L.control.scale({
    imperial: false,
    maxWidth: 200
}).addTo(map);


// Wetterstationsdaten einbinden
let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';


// Funktion für Einfärbung (colors.js)
let getColor = (value, colorRamp) => {
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";                                                 // falls Wert nicht abgdeckt wird
};

// Funkjtion Windrichtung Übersetzung
let windlabel = (value) => {
    let windRamp = DIRECTIONS
    for (let rule of windRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.dir;
        }
    }
}

// Funktion erzeugt Marker
let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors)
    let label_fun = L.divIcon({
        html: `<div style="background-color:${color}">${options.value}</div>`,
        className: "text-label"                                     // ansprechen im css über . .text-label div
    })
    let marker_fun = L.marker([coords[1], coords[0]], {
        icon: label_fun,
        title: `${options.station} (${coords[2].toFixed(0)}m)`
    })
    return marker_fun;
};



// Daten holen...
fetch(awsURL)                                       // Anfrage auf Sever
    .then(answer => answer.json())                  // wenn ok => Daten laden und in json konvertieren 
    .then(json => {                                 // wenn ok => mit dem json-Objekt in nächsten Funktion weiterarbeiten
        for (station of json.features) {            // für jeden Eintrag in json.features = station (je Objekt mit geometry, properties, ...):
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
                    <li>Windrichtung: ${windlabel(station.properties.WR) || '?'}</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
                `);

            // Marker für Schneehöhen
            if (typeof station.properties.HS == "number" &&  station.properties.HS >= 0) {                 // wenn Schneehöhe vorhanden ist und >= 0 
                let mrk = newLabel(station.geometry.coordinates, {                                         // das was die Funktion zurückgibt wird in mrk gespeichert
                    value: station.properties.HS.toFixed(0),                                               // auf ganze Zahl runden
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                mrk.addTo(overlays.snowheight)
            };
            
            // Marker für Windstärke
            if (typeof station.properties.WG == "number") {                        // wenn Windstärke vorhanden 
                let mrk = newLabel(station.geometry.coordinates, {                 // das was die Funktion zurückgibt wird in mrk gespeichert
                    value: station.properties.WG.toFixed(0),                       // auf ganze Zahl runden
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                mrk.addTo(overlays.windspeed)
            };

            // Marker für Lufttemperatur
            if (typeof station.properties.LT == "number") {                        // wenn Temperatur vorhanden ist
                let mrk = newLabel(station.geometry.coordinates, {                 // das was die Funktion zurückgibt wird in mrk gespeichert
                    value: station.properties.LT.toFixed(1),                       // auf eine Nachkommastelle runden
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                mrk.addTo(overlays.temperature)
            };

            // Marker für Leuftfeuchtigkeit
            if (typeof station.properties.RH == "number") {                        // wenn Wert vorhanden ist
                let mrk = newLabel(station.geometry.coordinates, {                 // das was die Funktion zurückgibt wird in mrk gespeichert
                    value: station.properties.RH.toFixed(0),                       // auf eine Nachkommastelle runden
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                mrk.addTo(overlays.humidity)
            };

        };
    
        
        // Karte an Extent von stations verschieben
        map.fitBounds(overlays.stations.getBounds());

    });


L.control.rainviewer().addTo(map);

// Mini-Map
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider('BasemapAT.grau'), {
        toggleDisplay: true,
        minimized: false,
        zoomLevelFixed: 6
    }
).addTo(map);
