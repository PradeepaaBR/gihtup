const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/watermarkDB");

const Upload = mongoose.model("Upload", {
  filename: String,
  original_path: String,
  watermarked_path: String,
  status: String,
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname),
});
const upload = multer({ storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const originalPath = req.file.path;
  const outputPath = "watermarked/" + req.file.filename;

  exec(`python watermark.py ${originalPath} ${outputPath}`, async (err) => {
    if (err) return res.status(500).json({ error: "Processing failed" });

    await Upload.create({
      filename: req.file.filename,
      original_path: originalPath,
      watermarked_path: outputPath,
      status: "processed",
    });

    res.json({ message: "File uploaded and watermarked" });
  });
});

app.get("/api/admin/leads", async (req, res) => {
  if (req.headers.adminpassword !== "admin123") return res.status(403).send("Unauthorized");
  const data = await Upload.find();
  res.json(data);
});

app.use("/watermarked", express.static("watermarked"));

app.listen(5000, () => console.log("Server running on port 5000"));