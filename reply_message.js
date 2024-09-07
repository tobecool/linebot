const https = require("https");
const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const TOKEN = process.env.LINE_ACCESS_TOKEN;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }));
app.use(express.static(path.join(__dirname, 'public')));



app.get("/", (req, res) => {
    // res.sendStatus(200);
    // 當用戶訪問網頁，投放html file
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post("/webhook", function (req, res) {
    // Send response back to LINE server
    res.send("HTTP POST request sent to the webhook URL!");
    // If the user sends a message to your bot, send a reply message
    req.body.events.forEach((event) => {
        if (event.type === "message") {
            let replyText;

            // Determine the reply based on the incoming message text
            switch (event.message.text) {
                case "hello":
                    replyText = "Hi there! How can I help you today?";
                    break;
                case "help":
                    replyText = "Sure! What do you need help with?";
                    break;
                default:
                    replyText = "Sorry, I didn't understand that.";
            }
            // You must stringify reply token and message data to send to the API server
            const dataString = JSON.stringify({
            // Define reply token
                replyToken: event.replyToken,
            // Define reply messages
                messages: [
                    {
                        type: "text",
                        text: replyText,
                    },
                ],
            });

            // Request header
            const headers = {
                "Content-Type": "application/json",
                Authorization: "Bearer " + TOKEN,
            };

            // Options to pass into the request
            // The request is sent to https://api.line.me/v2/bot/message/reply
            // which is the endpoint in the LINE Messaging API specifically for sending reply messages 
            const webhookOptions = {
                hostname: "api.line.me",
                path: "/v2/bot/message/reply",
                method: "POST",
                headers: headers,
                // body: dataString,
            };

            // Define our request
            // For debugging and logging
            const request = https.request(webhookOptions, (res) => {
                res.on("data", (d) => {
                    process.stdout.write(d);
                });
            });
            // Handle error
            // if an error occurs while sending a request to the API server.
            request.on("error", (err) => {
                console.error(err);
            });

            // Finally send the request and the data we defined
            request.write(dataString);
            request.end();
        }    
    });
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});

