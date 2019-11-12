const express = require('express');
const axios = require('axios');
const _socket = require('socket.io');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const app = express();
const port = 3000;

const critServMachines = require('./nodes');

const server = app.listen(port, () => console.log("App now listening on port "+ port) );

var latestReport = [];
var repId = 0;
var io = _socket(server);

const MONITOR_INTERVAL = 2000;
const MONITOR_TIMEOUT = 1800;

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html') );
app.get('/crit-serv', async (req, res) => {
    var availableMachines = latestReport.filter(e => e.serviceStatus === true);
    console.log('[crit-serv] Available machines count: '+availableMachines.length);
    for (var i=0; i<availableMachines.length;i++) {
        var result;
        try {
            result = await axios({
                method: "get",
                url: `http://${availableMachines[i].machine.ip}:${availableMachines[i].machine.port}/crit-serv?n1=${req.query.n1}&n2=${req.query.n2}`,
                timeout: 1000 * 2,
                headers: { "Content-Type": "application/json" }
            });
        } catch (e) {
            console.log('[crit-serv] Error whiel requesting machine '+critServMachines[i].ip+":"+critServMachines[i].port);
            continue;
        }
        if (result.data && result.data.rand && result.data.sum) {
            console.log('[crit-serv] Completing request');
            res.status(200).json(result.data);
            return;
        }
    }
    res.status(503).send("Service unavailable");
});

app.use(express.static("public"));


setInterval(async () => {
    var promises = [];
    critServMachines.forEach(e => {
        promises.push(
            exec(`ping -n 1 -w ${MONITOR_TIMEOUT} ${e.ip} `)
        );
        promises.push(
            axios({
                method: "get",
                url: `http://${e.ip}:${e.port}/crit-serv?n1=12&n2=34`,
                timeout: MONITOR_TIMEOUT,
                headers: { "Content-Type": "application/json" }
            })
        );
    });
    var report = [];
    const res = await Promise.all(promises.map(p => p.catch(e => e)));
    for (var i=0; i<res.length; i+=2) {
        report.push({
            machine: critServMachines[i/2],
            pingStatus: res[i].stdout.indexOf("5000 (?) open") !== -1 || res[i].stdout.indexOf("Received = 1,") !== -1,
            serviceStatus: res[i+1].status === 200 && res[i+1].data && critServMachines[i/2].validation(res[i+1].data)
        });
        // console.log(res[i].stdout.trim());
        // console.log(res[i+1].data);
        console.log("[Monitored] "+critServMachines[i/2].ip+":"+critServMachines[i/2].port)
    }
    latestReport = report;
    repId++;
    // Promise.all(promises).then(res => {
    //     // console.log(responses);
    // }).catch(err => {
    //     console.log(err);
    // });
}, MONITOR_INTERVAL);

io.on('connection', socket => {
    console.log("User connected");
    var id = setInterval(() => {
        socket.emit('report', {...latestReport, repId});
    });
    socket.on('disconnect', () => clearImmediate(id));
});
