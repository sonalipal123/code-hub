require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-this';
if (!MONGO_URI) {
  console.error('MONGO_URI not set. Please set it in .env');
  process.exit(1);
}

async function start() {
  await mongoose.connect(MONGO_URI);

  console.log("MongoDB connected");

  const app = express();
  app.use(express.json());

  // 1. Frontend folder (HTML, CSS) ko root (/) par serve karein
  app.use(express.static(path.join(__dirname, "../frontend")));

  // Route for C Programs
  app.get("/code/c-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/cPrograms.html"));
  });

  // Route for C++ Programs
  app.get("/code/cpp-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/cpp_programs.html"));
  });

  // Route for Java Programs
  app.get("/code/java-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/javaPrograms.html"));
  });

  // Route for Python Programs
  app.get("/code/python-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/pythonPrograms.html"));
  });

  // Route for JS Programs
  app.get("/code/js-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/jsPrograms.html"));
  });
  app.get("/code/html-syntaxes", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/htmlPrograms.html"));
  });
  app.get("/code/css-classes", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/cssPrograms.html"));
  });
  app.get("/code/angular-js-programs", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/angular_JsPrograms.html"));
  });

  // signup
  app.post("/api/signup", async (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    // checking if already user exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      passwordHash, // Store the hash
      bookmarks: [],
    });

    await newUser.save(); // Save to MongoDB

    // 3. Generate token
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  });

  // login
  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ message: "Missing fields" });
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  });

   app.post("/api/reset-password", async (req, res) => {
     const { email, newPassword } = req.body;

     if (!email || !newPassword) {
       return res
         .status(400)
         .json({ message: "Email and new password required" });
     }

     try {
       // 1. User dhoondo
       const user = await User.findOne({ email });
       if (!user) {
         return res
           .status(404)
           .json({ message: "User with this email not found" });
       }

       // 2. Naya password hash karo
       const passwordHash = await bcrypt.hash(newPassword, 10);

       // 3. Update karo
       user.passwordHash = passwordHash;
       await user.save();

       res.json({ success: true, message: "Password updated successfully" });
     } catch (err) {
       console.error(err);
       res.status(500).json({ message: "Server error" });
     }
   });

  // middleware: authenticate
  async function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer "))
      return res.status(401).json({ message: "Missing token" });
    const token = auth.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // Find user by Mongoose _id
      const user = await User.findById(payload.userId);

      if (!user) return res.status(401).json({ message: "Invalid token" });

      req.user = user;
      next();
    } catch (e) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  // add bookmark (body: { id: 'hello-1' })
  app.post(`/api/bookmarks/toggle`, authMiddleware, async (req, res) => {
    const { programId } = req.body; // Expecting { "programId": "c-array-1" }
    const userId = req.user._id;

    if (!programId)
      return res.status(400).json({ message: "Program ID required" });

    try {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // Check if ID exists in array
      const index = user.bookmarks.indexOf(programId);

      if (index === -1) {
        // Not found? Add it.
        user.bookmarks.push(programId);
      } else {
        // Found? Remove it.
        user.bookmarks.splice(index, 1);
      }

      await user.save();
      res.json({ success: true, bookmarks: user.bookmarks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // get bookmarks (returns ids)
  app.get(`/api/bookmarks`, authMiddleware, async (req, res) => {
    try {
      // Find user by ID (from token) and return only the bookmarks array
      const user = await User.findById(req.user._id).select("bookmarks");
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ bookmarks: user.bookmarks });
    } catch (err) {
      res.status(500).json({ error: err.message });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // start
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Server running on", PORT));
}


start().catch((e) => console.error("Server failed to start:", e));