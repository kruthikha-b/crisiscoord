const dbURL = "https://disaster-alert-system-cf26d-default-rtdb.firebaseio.com/sensor.json";

async function getData() {
  try {
    const res = await fetch(dbURL);
    const data = await res.json();

    const water = data.water_level;
    const temp = data.temperature;

    document.getElementById("water").innerText = "Water Level: " + water;
    document.getElementById("temp").innerText = "Temperature: " + temp;

    if (water > 500) {
      document.getElementById("status").innerText = "⚠️ Flood Warning!";
      document.body.style.backgroundColor = "#ffcccc";
    } else {
      document.getElementById("status").innerText = "✅ Safe";
      document.body.style.backgroundColor = "#ccffcc";
    }

  } catch (err) {
    document.getElementById("status").innerText = "Error fetching data";
  }
}

setInterval(getData, 2000);
