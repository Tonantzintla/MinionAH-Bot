import express from "express";
import notifications from "./notification/index.js";

// Create app
const app = express();

//Middlewares
app.use(express.json());

//Routes
app.use("/notifications", notifications);

async function init(): Promise<void> {
  return new Promise((res) => {
    app.listen(process.env.WEB_PORT!, () => {
      console.log(`Web api running on port: ${process.env.WEB_PORT!}`);
      res();
    });
  });
}

export default { init };
