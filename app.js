const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Post = require("./models/post");

require("dotenv").config(); // ✅ Load .env variables

const app = express();

// Middleware
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ MongoDB connection from environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Home route - list all posts
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find({});
    res.render("home", { posts });
  } catch {
    res.status(500).send("Error loading posts");
  }
});

// New Post page
app.get("/new", (req, res) => {
  res.render("new");
});

// Create Post
app.post("/new", async (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });
  await post.save();
  res.redirect("/");
});

// View Single Post
app.get("/posts/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");
    res.render("post", { post });
  } catch {
    res.status(400).send("Invalid Post ID");
  }
});

// Delete Post
app.post("/delete/:id", async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect("/");
});

// Edit Page
app.get("/edit/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).send("Post not found");
    res.render("edit", { post });
  } catch {
    res.status(400).send("Invalid Post ID");
  }
});

// Handle Edit
app.post("/edit/:id", async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, {
    title: req.body.title,
    content: req.body.content,
  });
  res.redirect("/posts/" + req.params.id);
});

// Start server
app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});
