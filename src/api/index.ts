import express from "express";
import notifications from "./notification/index.js";
import { AllErrorHandler, JsonErrorHandler } from "./lib/middlewares/error.js";
// Create app
const app = express();

//Middlewares
app.use(express.json());
app.use(JsonErrorHandler);
app.use(AllErrorHandler);
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
