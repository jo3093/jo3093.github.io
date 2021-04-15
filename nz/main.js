let stop = {
    nr: 24,
    name: "Rotorua",
    lat: -38.137778,
    lng: 176.251389,
    user: "jo3093",
    wikipedia: "https://en.wikipedia.org/wiki/Champagne_Pool"
  }
  
  const map = L.map("map", {
    // center: [stop.lat, stop.lng],
    // zoom: 13,
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    ]
  });
  
  let nav = document.querySelector("#navigation");
  // console.log(ROUTE);
  ROUTE.sort((stop1, stop2) => {
    if (stop1.nr > stop2.nr) {
        return 1;
    } else {
        return -1;
    }
  });
  for (let entry of ROUTE) {
    // console.log(entry)

    nav.innerHTML += `<option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>`;
    let mrk = L.marker([ entry.lat, entry.lng ]).addTo(map);
    mrk.bindPopup(`
        <h3>Stop ${entry.nr}: ${entry.name}</h3>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${stop.wikipedia}">Read about stop in Wikipedia</a></p>
    `);

    if (entry.nr == 24) {
        map.setView([entry.lat, entry.lng], 13);
        mrk.openPopup();
    }

}

nav.selectedIndex = 24 - 1;
nav.onchange = (evt) => {
    console.log(evt.target.selectedIndex);
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;

    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;
    window.location.href = link;
    console.log(link);
}
// console.log(document.querySelector("#map"));
// <option value="jo3093">Rotorua</option>
// console.log(document.querySelector("#map"));