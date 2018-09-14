const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();

// create simple http server
const server = http.createServer(app);

// create websocket server
const wss = new WebSocket.Server({ server });

// list of phrases
const eatAnswers = require('./data/EatAnswers.json');
const waitingResponses = require('./data/WaitingResponses.json');

// remove duplicate answer in a row
var lastAnswer = null;

const randomAnswer = (answers) => {
    const answer = Math.floor((Math.random() * (answers.length-1)));
    if (answer == lastAnswer) {
        return randomAnswer(answers);
    }
    lastAnswer = answer;
    return answers[answer];
}

// on connection to server
wss.on('connection', ws => {
    // check for broken connection
    ws.isAlive = true;
    ws.lastSent = new Date();
    ws.on('pong', () => {
        ws.isAlive = true;
    });
    
    // event when connected to server
    ws.on('message', message => {
        // log received message
        console.log('received: %s', message);
        
        const broadcastRegex = /^broadcast\:/;

        if (broadcastRegex.test(message)) {
            message = message.replace(broadcastRegex, '');

            // send message back to other clients
            wss.clients
                .forEach(client => {
                    if (client != ws) {
                        sendMessage(client, eatAnswers);
                    }
                });
        } else {
            ws.lastSent = new Date();
            sendMessage(ws, eatAnswers);
        }
    });
});

// send message that client is typing before sending message
const sendMessage = (client, answers) => {
    client.send(JSON.stringify({
        state: 'TYPING',
        answer: ''
    }));
    setTimeout(() => {
        client.send(JSON.stringify({
            state: 'SENT',
            answer: randomAnswer(answers)
        }))
    }, 2000)
}

// every ten seconds ping if connection is still up
setInterval(() => {
    wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();

        ws.isAlive = false;
        let current = new Date();
        let timeDiff = Math.round((current - ws.lastSent)/1000);
        // if you haven't messaged in ten seconds
        if (timeDiff > 10) {
            sendMessage(ws, waitingResponses);
        }
        ws.ping(null, false, true);
    });
}, 15000)

server.listen(process.env.PORT || 3001, () => {
    console.log(`Server started on port ${server.address().port}`);
})