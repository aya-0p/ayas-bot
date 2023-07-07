import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import schedule from "node-schedule";
import { exec } from "node:child_process";
import { env } from "../env/index.js";
const app = express();
const port = env.project.ports.control;
let log: boolean,
  main0: boolean,
  main1: boolean,
  main_c = 0;

app.listen(port, function () {
  console.log("Server Started");
  exec(`gnome-terminal --tab --working-directory=${env.project.rootDirPath}/log -- node . --enable-source-maps`);
});
app.use(bodyParser.json());

app.get("/start/log", async (req, res, next) => {
  logcheck();
  if (!log) {
    log = true;
  }
  res.send("ok");
  exec(`gnome-terminal --tab --working-directory=${env.project.rootDirPath}/main -- node ./scripts/server.js --enable-source-maps`);
  const logServer = axios.create({
    baseURL: `http://localhost:${env.project.ports.log}`,
    proxy: false,
    headers: { "Content-Type": "application/json" },
  });
  app.post("/log", (req, res) => {
    const { body } = req;
    res.send("ok");
    logServer.post("/log", body).catch(() => {
      console.log("Cannot send message to logServer.");
      console.log(body);
    });
  });
  app.post("/mention", (req, res) => {
    logServer.post("/mention").catch(() => {
      console.log("Cannot send message to logServer.");
    });
    res.send("ok");
  });
});

app.get("/start/main", (req, res) => {
  //main0 - the bot is running
  if (main0) return;
  main0 = true;
  if (main1) return;
  main1 = true;
  schedule.scheduleJob("* * * * * *", () => {
    //main1 - this schedule is running
    if (!main0) return;
    axios
      .get(`http://localhost:${env.project.ports.main}`, { timeout: 1000 })
      .then(() => {
        main_c = 0;
      })
      .catch(() => {
        main_c++;
        if (main_c === 10) {
          axios
            .post(`http://localhost:${env.project.ports.log}/mention`)
            .catch(() => {
              console.log("Cannot send message to logServer.");
            });
          axios
            .post(`http://localhost:${env.project.ports.log}/log`, {
              postedGuildId: "error",
              title: "Main Server Has Stopped",
              color: 16711680,
            })
            .catch(() => {
              console.log("Cannot send message to logServer.");
            });
          main0 = false;
          exec(
            `gnome-terminal --tab --working-directory=${env.project.rootDirPath}/main -- node ./scripts/server.js --enable-source-maps`
          );
        }
      });
  });
  res.send("ok");
});

let log0: boolean,
  log1: boolean,
  log_c = 0;
const logcheck = () => {
  //log0 - the bot is running
  if (log0) return;
  log0 = true;
  if (log1) return;
  log1 = true;
  schedule.scheduleJob("* * * * * *", () => {
    //log1 - this schedule is running
    if (!log0) return;
    axios
      .get(`http://localhost:${env.project.ports.log}`, { timeout: 1000 })
      .then(() => {
        log_c = 0;
      })
      .catch(() => {
        log_c++;
        if (log_c === 10) {
          console.log("Log server has stoped!");
          log0 = false;
          exec(`gnome-terminal --tab --working-directory=${env.project.rootDirPath}/log -- node . --enable-source-maps`);
        }
      });
  });
};

app.get("/stop/main", (req, res) => {
  main0 = false;
  axios.get(`http://localhost:${env.project.ports.main}/stop`).catch(() => {
    console.log("Cannot stop main server.");
  });
  axios
    .post(`http://localhost:${env.project.ports.log}/log`, {
      postedGuildId: "error",
      title: "Main server will stop in 10s",
      color: 16711680,
    })
    .catch(() => {
      console.log("Cannot send message to logServer.");
    });
  res.send("ok");
});

app.post("/web", (req, res) => {
  const logServer = axios.create({
    baseURL: `http://localhost:${env.project.ports.log}`,
    proxy: false,
    headers: { "Content-Type": "application/json" },
  });
  logServer
    .post("/web", {
      body: req.body.body,
    })
    .catch(() => {
      console.log("Cannot send message to logServer.");
    });
  res.send("ok");
});
app.get("/", (req, res) => {
  res.send("ok");
});
