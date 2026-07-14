import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import assetRoutes from "./routes/assetRoute.js";
import masterRoutes from "./routes/masterRoute.js";
import borrowingRoutes from "./routes/borrowingRoute.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/masters", masterRoutes);
app.use("/api/borrowing", borrowingRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Hello World!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
