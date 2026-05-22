const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/api/gemini', async (req, res) => {
    try {
        const { apiKey, code, prompt, mode } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ reply: "Missing API Key parameter." });
        }

        let systemInstruction = "You are a professional Roblox Luau script evaluator and dynamic live mentor. Analyze the script, assess safety, features, logic flaws, and completeness. Assign star score rating out of 5 stars using solid symbols like ★★★★★. Highlight redundant features, omissions or syntax bugs directly. Wrap answers cleanly without extra Markdown files or verbose meta notes. Respond strictly in Vietnamese.";
        
        if (mode === "hint") {
            systemInstruction += " Do not solve the entire code block for the user. Provide discrete progressive hints, direct tips, or minimal snippets to nudge them in the right direction.";
        }

        let dynamicPrompt = ``;
        if (mode === "hint") {
            dynamicPrompt = `Current Roblox Code Context:\n\n${code}\n\nGive me a progressive structural hint to optimize or complete this script based on its current pattern.`;
        } else {
            dynamicPrompt = `Current Roblox Code Context:\n\n${code}\n\nUser Request/Message:\n${prompt}\n\nAnalyze the structure, rate it out of 5 stars using stars symbols, evaluate efficiency against alternative solutions, underline redundant parts or missing features.`;
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        
        const response = await axios.post(geminiUrl, {
            contents: [
                {
                    parts: [
                        { text: systemInstruction + "\n\n" + dynamicPrompt }
                    ]
                }
            ]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.data && response.data.candidates && response.data.candidates[0].content && response.data.candidates[0].content.parts) {
            const aiReply = response.data.candidates[0].content.parts[0].text;
            return res.json({ reply: aiReply });
        } else {
            return res.json({ reply: "Error parsing generation text structure from Google API framework backend." });
        }

    } catch (error) {
        let errMsg = error.message;
        if (error.response && error.response.data) {
            errMsg = JSON.stringify(error.response.data);
        }
        return res.status(500).json({ reply: "Proxy Server Error: " + errMsg });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
