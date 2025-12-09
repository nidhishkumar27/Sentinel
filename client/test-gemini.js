const API_KEY = 'AIzaSyCUMu76Cr2P5-WKZ5F4FVsLBCnYmIf3a0c';
const MODEL = 'gemini-1.5-flash';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

async function testGemini() {
    console.log(`Testing Gemini API (${MODEL})...`);
    console.log(`Endpoint: ${URL.replace(API_KEY, 'HIDDEN_KEY')}`);

    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, confirm you are working." }] }]
            })
        });

        console.log(`Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Response:", errorText);
        } else {
            const data = await response.json();
            console.log("Success!");
            // console.log("Response:", JSON.stringify(data, null, 2));
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log("Model Output:", text);
        }
    } catch (err) {
        console.error("Fetch Failed:", err);
    }
}

testGemini();
