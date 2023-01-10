const path = require('path');
const express = require('express');
const App = express();
const http = require('http');
const server = http.createServer(App);
const { Server } = require("socket.io");
const db = require('./DBConnection');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const io = new Server(server);

App.use(express.json());
App.use(express.urlencoded({extended: false}));
App.use(express.static(path.join(__dirname, '/')));

server.listen(4562, () =>{ });

var totalUsers = 0;

io.on('connection', (socket) => {
    totalUsers++;
    io.emit('total-users', {totalUsers: totalUsers});

    socket.on('disconnect', () => {
        if(totalUsers !== 0){
            totalUsers--;
            io.emit('total-users', {totalUsers: totalUsers});
        }
    });

    socket.on('chat message', (data) =>{
        saveMessage(data).then(resp =>{
            getMessages().then(resp =>{
                io.emit('chat message', resp);
            })
        });
    })
});

App.get('/messages', (req, res) =>{
    const msgs = getMessages();
    msgs.then((resp =>{
        res.status(200).json(resp)
    })).catch(error =>{
        console.log(error);
    });
});

function saveMessage(data){
    return new Promise((resolve, reject) =>{
        db.getConnection((error, conn) =>{
            let query = 'INSERT INTO chat_log(message, time_sent) VALUES(?, ?)';
            let date = new Date();
            
            var cleanMessage = DOMPurify.sanitize(data.message);
            conn.query(query, [cleanMessage, date], (error, results, fields) => {
                if(results){
                    resolve(results);
                }
            });
            conn.release();
        });
    });
}

function getMessages(){
    return new Promise((resolve, reject) => {
        db.getConnection((error, conn) =>{
            let query = 'SELECT chatId, message, time_sent FROM chat_log';
            conn.query(query, (error, results, fields) => {
                if(results){
                    resolve(results);
                }
            });
            conn.release();
        });
    });
}