import axios from "axios";
import express from "express";
import { env } from "../../../env/index.js";
import schedule from "node-schedule";
export default () => {
  const app = express();
  app.get("/", (_req, res) => res.send("ok"));
  app.get("/stop", (_req, res) => {
    res.send("ok");
    setTimeout(() => process.exit(), 10000);
  });
  app.listen(env.project.ports.main, () =>
    axios
      .get(
        `http://localhost:${env.project.ports.control}/start/${
          env.project.test ? "test" : "main"
        }`
      )
      .catch(() => {})
  );
  let t: number = 0;
  schedule.scheduleJob("* * * * * *", () => {
    axios
      .get(`http://localhost:${env.project.ports.control}`, { timeout: 500 })
      .then(() => {
        t = 0;
      })
      .catch(() => {
        t++;
        if (t === 5) process.exit();
      });
  });
};
