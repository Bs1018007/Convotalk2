import express from "express";
import { MongoDB} from "./lib/db.js";
import dotenv from "dotenv";
import Cookieparser from "cookie-parser";
import AuthRoutes from "./Routes/AuthRoutes.js";
import MessageRoutes from "./Routes/MessageRoutes.js";
import cors from "cors";
import { app, server } from "./lib/socket.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import "./lib/passport.js"; 
import GoogleAuthRoutes from "./Routes/GoogleAuthRoutes.js"; 
import path from "path";

const __dirname = path.resolve();

dotenv.config();

const port = process.env.PORT || 3000;
const FRONTEND_URL = process.env.NODE_ENV === "production" 
  ? "https://convotalk2-1.onrender.com"
  : "http://localhost:5173";

app.use(express.json({ limit: "10mb" }));
app.use(Cookieparser());

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      domain: process.env.NODE_ENV === "production" ? process.env.COOKIE_DOMAIN : undefined
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", AuthRoutes);
app.use("/api/message", MessageRoutes);
app.use("/auth", GoogleAuthRoutes); 

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "..", "dist");
  console.log("Serving static files from:", frontendPath);
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  MongoDB();
});
