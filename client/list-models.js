const API_KEY = 'AIzaSyCUMu76Cr2P5-WKZ5F4FVsLBCnYmIf3a0c';
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

async function listModels() {
    console.log(`Listing models...`);

    try {
        const response = await fetch(URL);
        const data = await response.json();

        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error("Fetch Failed:", err);
    }
}

listModels();
