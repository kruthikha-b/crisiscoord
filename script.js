const dbURL = "https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/sensor.json";
// Initialize map
const map = L.map('map').setView([17.3850, 78.4867], 13); // Hyderabad example


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add marker
let marker = L.circleMarker([17.3850, 78.4867], {
  radius: 10,
  color: "green"
}).addTo(map);
async function getData() {
   let alerts = [];
  try {
    const res = await fetch(dbURL);
    const data = await res.json();

    const water = data.water_level;
    const temp = data.temperature;
    const gas = data.gas_level;
    const vibration = data.vibration;

    // Display sensor values
    document.getElementById("water").innerText = "Water Level: " + water;
    document.getElementById("temp").innerText = "Temperature: " + temp;
    document.getElementById("gas").innerText = "Gas Level: " + gas;
    document.getElementById("vibration").innerText = "Vibration: " + vibration;

   
    let color = "#ccffcc"; // default safe

    // 🌊 Flood
    if (water > 500) {
      alerts.push("🌊 Flood Alert");
      color = "#99ccff";
    }

    // 🔥 Heatwave
    if (temp > 45) {
      alerts.push("🔥 Heatwave Alert");
      color = "#ffcc99";
    }

    // 💨 Gas Leak
    if (gas > 300) {
      alerts.push("💨 Gas Leak Detected");
      color = "#ff9999";
    }

    // 🌍 Earthquake / Vibration
    if (vibration > 1) {
      alerts.push("🌍 Earthquake / Structural Risk");
      color = "#ccccff";
    }

    // Final status
 const alertsContainer = document.getElementById("alerts-list");

if (alerts.length === 0) {
  document.getElementById("status").innerText = "Safe";

  alertsContainer.innerHTML =
    `<div class="alert-item alert-safe">✅ No active alerts</div>`;
} else {
  document.getElementById("status").innerText = alerts.join(" | ");

  alertsContainer.innerHTML = alerts.map(a => {
    let cls = "alert-warning";

    if (a.includes("Gas") || a.includes("Earthquake")) {
      cls = "alert-danger";
    }

    return `
      <div class="alert-item ${cls}">
        <span>${a}</span>
        <span style="font-size:12px;opacity:0.7;">Now</span>
      </div>
    `;
  }).join("");
}
    

  } catch (err) {
    document.getElementById("status").innerText = "Error fetching data";
  }
  // Update marker popup based on status
marker.bindPopup(document.getElementById("status").innerText);
  if (alerts.length === 0) {
  marker.setStyle({ color: "green" });
} else {
  if (alerts.includes("🌊 Flood Alert")) {
  marker.setStyle({ color: "blue" });
}
else if (alerts.includes("🔥 Heatwave Alert")) {
  marker.setStyle({ color: "orange" });
}
else if (alerts.includes("💨 Gas Leak Detected")) {
  marker.setStyle({ color: "red" });
}
else if (alerts.includes("🌍 Earthquake / Structural Risk")) {
  marker.setStyle({ color: "purple" });
}
else {
  marker.setStyle({ color: "green" });
}
}
}
async function submitAlert() {
  const place = document.getElementById("place").value;
  const type = document.getElementById("type").value;

  if (!place || !type) {
    alert("Please enter location and type");
    return;
  }

  try {
    // 🌍 Convert place → coordinates
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
    );
    const geoData = await geoRes.json();

    if (geoData.length === 0) {
      alert("Location not found");
      return;
    }

    const lat = parseFloat(geoData[0].lat);
    const lng = parseFloat(geoData[0].lon);

    // 📍 Add alert marker
    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`🚨 ${type} at ${place}`)
      .openPopup();

    // 🚀 FETCH RESOURCES
    const res = await fetch("https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/resources.json");
    const resources = await res.json();

    // 🎯 Decide required resource type
    let requiredType = "Ambulance";

    if (type.toLowerCase().includes("fire") || type.toLowerCase().includes("gas")) {
      requiredType = "Fire Truck";
    }

    let nearest = null;
    let minDist = Infinity;

    // 🔍 Find nearest matching resource
    for (let key in resources) {
      const r = resources[key];

      if (r.type !== requiredType) continue;

      const dist = getDistance(lat, lng, r.lat, r.lng);

      if (dist < minDist) {
        minDist = dist;
        nearest = r;
      }
    }

    // 🎯 Show result
    if (nearest) {
      L.circleMarker([nearest.lat, nearest.lng], {
        radius: 12,
        color: "yellow"
      })
      .addTo(map)
      .bindPopup(`Nearest ${nearest.type} (${minDist.toFixed(2)} km)`);

      alert(`Nearest ${nearest.type} is ${minDist.toFixed(2)} km away`);
    } else {
      alert("No suitable resource found");
    }

    // 💾 Save alert
    fetch("https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/alerts.json", {
      method: "POST",
      body: JSON.stringify({ lat, lng, type })
    });

  } catch (err) {
    console.error(err);
    alert("Error fetching location");
  }
}

async function loadResources() {
  try {
    const res = await fetch("https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/resources.json");
    const data = await res.json();

    for (let key in data) {
      const r = data[key];

      let color = "blue";

      if (r.type === "Ambulance") color = "green";
      else if (r.type === "Fire Truck") color = "red";
      else if (r.type === "Police") color = "blue";

      L.circleMarker([r.lat, r.lng], {
        radius: 8,
        color: color
      })
      .addTo(map)
      .bindPopup("🚨 " + r.type);
    }

  } catch (err) {
    console.log("Error loading resources:", err);
  }
}

// call it once
loadResources();
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
// update every 2 seconds
setInterval(getData, 2000);
