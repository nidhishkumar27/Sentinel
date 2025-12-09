const API_KEY = '26RFJPH8H597T4AZ2FNCCJA4Z';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';
const location = 'London';

async function test() {
    const url = `${BASE_URL}/${location}?unitGroup=metric&key=${API_KEY}&contentType=json`;
    console.log("Fetching: " + url);
    try {
        const response = await fetch(url);
        console.log("Status:", response.status);
        if (!response.ok) {
            console.log("Error body:", await response.text());
        } else {
            const data = await response.json();
            console.log("Success! Address:", data.address);
            console.log("Current Temp:", data.currentConditions.temp);
        }
    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

test();
