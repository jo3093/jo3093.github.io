let basemapGray = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT.surface": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay")
    ])
}).addTo(map);

let awsLayer = L.featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
// awsLayer.addTo(map);

let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhen");
// snowLayer.addTo(map);

let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeit");
windLayer.addTo(map);

let awsURL = "https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson";
fetch(awsURL)
    .then(response => response.json())
    .then(json => {
        // console.log("Daten konvertiert: ", json);
        for (station of json.features) {
            // console.log("Station: ", station);

            // Stationsmarker
            let marker = L.marker([
                station.geometry.coordinates[1],
                station.geometry.coordinates[0]
            ]);

            // Datum formatieren
            let formattedDate = new Date(station.properties.date);

            // Pop-up
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleString("de")}</li>
                    <li>Seehöhe: ${station.geometry.coordinates[2]} m</li>
                    <li>Temperatur: ${station.properties.LT || 'nicht verfügbar'} °C</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || 'nicht verfügbar'} m/s</li>
                    <li>Windrichtung: ${station.properties.WR || 'nicht verfügbar'}</li>
                    <li>rel. Luftfeuchtigkeit: ${station.properties.RH || 'nicht verfügbar'} %</li>
                    <li>Luftdruck: ${station.properties.LD || 'nicht verfügbar'} hPA</li>
                    <li>Schneehöhe: ${station.properties.HS || 'nicht verfügbar'} cm</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(awsLayer);

            // Marker wenn Schneehöhe vorhanden
            if (station.properties.HS) {

                // je nach Wert andere Farbe
                let snowhighlightClass = " ";
                if (station.properties.HS > 100) {
                    snowhighlightClass = "snow-100";
                };
                if (station.properties.HS > 200) {
                    snowhighlightClass = "snow-200";
                };

                // SnowIcon (div)
                let snowIcon = L.divIcon({
                    html: `<div class="snow-label ${snowhighlightClass}">${station.properties.HS}</div>`
                });

                // Marker
                let snowmarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowmarker.addTo(snowLayer);
            };

            // Marker wenn Windgeschwindigkeit vorhanden
            if (station.properties.WG) {

                // je nach Wert andere Farbe
                let windhighlightClass = " ";
                if (station.properties.WG > 10) {
                    windhighlightClass = "wind-10";
                };
                if (station.properties.WG > 20) {
                    windhighlightClass = "wind-20";
                };

                // WindIcon (div)
                let windIcon = L.divIcon({
                    html: `<div class="wind-label ${windhighlightClass}">${station.properties.WG}</div>`
                });

                // Marker
                let windmarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windmarker.addTo(windLayer);

            };



        };

        // Kartenzoom auf alle Marker
        map.fitBounds(awsLayer.getBounds());
    });