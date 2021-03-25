
const map = L.map("map", {
    center: [-38.137778, 176.251389],
    zoom: 13,
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]
  });

  let mrk = L.marker([-38.137778, 176.251389]).addTo(map);
  mrk.bindPopup('Rotorua').openPopup();

  console.log(document.querySelector('#map'));