import express from "express";

const app = express();

async function init(): Promise<void> {
  app.use(express.json());

  return new Promise((res) => {
    app.listen(process.env.WEB_PORT!, () => {
      console.log(`Web api running on port: ${process.env.WEB_PORT!}`);
      res();
    });
  });
}

export default { init };
