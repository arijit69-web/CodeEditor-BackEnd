const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require("cors")
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
const judge0Config = {
    baseURL: 'https://judge0-ce.p.rapidapi.com',
    headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
    }
};
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: `Coding Arrow Code Editor is Up & Running at ${PORT}`
    });
});
app.post('/submit', async (req, res) => {
    var languageId = 0
    if (req.body.languageType === 'cpp') {
        languageId = 52
    }
    else if (req.body.languageType === 'java') {
        languageId = 62
    }
    else if (req.body.languageType === 'python') {
        languageId = 71
    }
    try {
        var options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions',
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'content-type': 'application/json',
                'Content-Type': 'application/json',
                'X-RapidAPI-Key': '5ee91fac93msh56e900b65eb9a06p131deajsnccd1a6de7cd7',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            },
            data: {
                language_id: languageId,
                source_code: btoa(req.body.sourceCode),
                stdin: btoa(req.body.userInput)
            }
        };
        const CodeSubmissionResponse = await axios.request(options);
        await new Promise(resolve => setTimeout(resolve, 5000));
        options = {
            method: 'GET',
            url: `https://judge0-ce.p.rapidapi.com/submissions/${CodeSubmissionResponse.data.token}`,
            params: {
                base64_encoded: 'true',
                fields: '*'
            },
            headers: {
                'X-RapidAPI-Key': '5ee91fac93msh56e900b65eb9a06p131deajsnccd1a6de7cd7',
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        if (!!response.data.compile_output) {
            res.status(200).json({ "output": decodeBase64(response.data.compile_output) });

        }
        else if (!!response.data.stderr) {
            res.status(200).json({ "output": decodeBase64(response.data.stderr) });

        }
        else {
            res.status(200).json({ "output": decodeBase64(response.data.stdout) });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'An error occurred while submitting the code' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

function decodeBase64(base64) {
    const text = atob(base64);
    const length = text.length;
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = text.charCodeAt(i);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}
