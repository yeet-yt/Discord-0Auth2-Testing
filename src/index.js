require('dotenv').config();
const express = require('express');
const axios = require('axios');
const url = require('url');

const port = process.env.PORT || 1500;
const app = express();

app.get('/api/auth/discord/redirect', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Missing authorization code');
    }

    const formData = new url.URLSearchParams({
        client_id: process.env.ClientID,
        client_secret: process.env.ClientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: "https://access.global-roleplay.xyz/api/auth/discord/redirect",
    });

    try {
        // Get access token
        const output = await axios.post('https://discord.com/api/v10/oauth2/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const access = output.data.access_token;

        // Get user info
        const userinfo = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${access}` },
        });

        console.log("OAuth Data:", output.data);
        console.log("User Info:", userinfo.data);

        // Format Variables
        const Variables = {
            variables: [
            {
                name: "token",
                variable: "{access_token}",
                value: access
            },
            {                
                name: "userid",
                variable: "{auth_user_id}",
                value: userinfo.data.id
            },
            {                
                name: "username",
                variable: "{auth_username}",
                value: `${userinfo.data.username}`
            },
            {                
                name: "refresh_token",
                variable: "{auth_refresh_token}",
                value: output.data.refresh_token
            }
            ]
        };

        // ⭐ POST to BotGhost webhook using axios, with API key in headers
        await axios.post(
            "https://api.botghost.com/webhook/1206694637360783430/uhr6s6n6jqjedi7d1adl",
            Variables,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "8080e187c0bf15d3643d3837911c2adc6537c70e2cf490d1d43d4aba0811856e"  // <-- add your API key here
                }
            }
        );

        // Redirect user to GitBook after sending data
        return res.redirect("https://rules.global-roleplay.xyz/starter-guide");

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        return res.status(500).send('An error occurred');
    }
});

// Start the server and log the port
app.listen(port, () => {
    console.log(`Running on port ${port}`);
});