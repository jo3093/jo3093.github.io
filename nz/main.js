let stop = {
    nr: 22,
    name: "Rotorua",
    lat: -38.137778,
    lng: 176.251389,
    user: "jo3093",
    wikipedia: "https://en.wikipedia.org/wiki/Champagne_Pool"
  }
  
  const map = L.map("map", {
    center: [ stop.lat, stop.lng ],
    zoom: 13,
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]
  });
  
  let mrk = L.marker([ stop.lat, stop.lng ]).addTo(map);
  mrk.bindPopup('Rotorua').openPopup();
  
  console.log(document.querySelector("#map"));