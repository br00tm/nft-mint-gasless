import { config as loadEnv } from "dotenv";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import mintRoute from "./routes/mintRoute.js";
import errorHandler from "./middlewares/errorHandler.js";
import logger from "./utils/logger.js";
import { getContract, getProvider, getWallet } from "./services/ethersProvider.js";

loadEnv();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/mint", mintRoute);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3001);

function warmup() {
  try {
    getProvider();
    const wallet = getWallet();
    const contract = getContract();
    logger.info("Backend ready", {
      relayer: wallet.address,
      contract: contract.target
    });
  } catch (error) {
    logger.warn("Backend started with incomplete configuration:", error.message);
  }
}

app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
  warmup();
});
