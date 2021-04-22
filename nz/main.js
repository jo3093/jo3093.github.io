// Variable stop (js-Objekt)
let stop = {
    nr: 24,
    name: "Rotorua",
    lat: -38.137778,
    lng: 176.251389,
    user: "jo3093",
    wikipedia: "https://en.wikipedia.org/wiki/Champagne_Pool" 
};


// Karte definieren 
// Variable map definieren, L.map Funktion bekommt die als Position für die Karte id (map) von dem div wo die Karte hinkommen soll 
const map = L.map("map", {
    // Karteneigenschaften (dictionary in js Objekt auch mit key: value Paaren)
    //center: [stop.lat, stop.lng],    // [] Liste/Array
    //zoom: 13,                            // 1 wäre ganze Welt
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")       // Layer mit OSM als Hintergrundkarte, s = Server, z = Zoomlevel, x = longitude, y = latitude 
    ]
});


// nav Variable definieren, die auf das navigation Element zugreift
let nav = document.querySelector("#navigation");


// ROUTE sortieren
ROUTE.sort((stop1, stop2) => {      // stop1 und stop2 (jeweils 2 aufeinanderfolgende stops)sollen sortiert werden (arrow-function)
    return stop1.nr > stop2.nr      // sortiert nach Nummer aufsteigend
});


// for-loop durch Stopps, jeweils Marker und Pop-up erstellen
for (let entry of ROUTE) {      // entry = Variable (jeder Eintrag) in ROUTE
    
    // Stop Eigenschaften mit option zu drop-down Liste hinzufügen je Schleife (+=)
    nav.innerHTML += `<option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>`;       // option Elemente zur Auswahl


    // Marker
    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);    // mit addTo(element) zur Karte (Element map) hinzufügen

    // Pop-up
    mrk.bindPopup(`
        <h4>${entry.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}">Read about stop in Wikipedia</a></p>        
    `);       // mrk = Leaflet-Marker hat die Methode .bindPopup, .openPopup öffnet direkt (immer nur ein/letzte Marker) - jetzt unten in if-Abfrage

    // Auf eigenen Stopp zeigen und Pop-up öffnen
    if (entry.nr == 24) {
        map.setView([entry.lat, entry.lng], 13);    // Karte auf eigene Position zentrieren und Zoomlevel
        mrk.openPopup();
    };
};    


// Reaktion bei Veränderung (bei Auswahl in Liste/pulldown)
nav.onchange = (evt) => {           // die Änderung wird in an evt übergeben
    let selected = evt.target.selectedIndex;    // speichert Index des ausgewählten Stops aus Liste in selected
    let options = evt.target.options;           // speichert die Optionen
    let username = options[selected].value;     // speichert den user der ausgewählten Etappe (für Link auf github-Seite)
    let link = `https://${username}.github.io/nz/index.html`;

    window.location.href = link;                // Browser verlässt die Seite und navigiert zu link

};










