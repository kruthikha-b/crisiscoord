const dbURL = "https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/sensor.json";

async function getData() {
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

    let alerts = [];
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
    if (alerts.length === 0) {
      document.getElementById("status").innerText = "✅ Safe";
    } else {
      document.getElementById("status").innerText = alerts.join(" | ");
    }

    document.body.style.backgroundColor = color;

  } catch (err) {
    document.getElementById("status").innerText = "Error fetching data";
  }
}

// update every 2 seconds
setInterval(getData, 2000);
