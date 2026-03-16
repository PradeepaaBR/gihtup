const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "_" + file.originalname)
});

const upload = multer({ storage });

app.post("/api/upload", upload.array("files"), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: "No files uploaded" });

    let uploadedFiles = [];

    for (let file of files) {
      let processedFile = file.path;
      const ext = path.extname(file.filename).toLowerCase();

      if (ext === ".jpg" || ext === ".jpeg" || ext === ".png") {
        // Get image dimensions
        const metadata = await sharp(file.path).metadata();
        const width = metadata.width;
        const height = metadata.height;

        // Create scalable watermark SVG
        const watermarkSVG = `
          <svg width="${width}" height="${height}">
            <text x="${width - 10}" y="${height - 10}" font-size="20" fill="rgba(255,0,0,0.5)" text-anchor="end">Watermark</text>
          </svg>
        `;

        processedFile = "uploads/watermarked_" + file.filename;
        await sharp(file.path)
          .composite([{ input: Buffer.from(watermarkSVG), gravity: "southeast" }])
          .toFile(processedFile);

        fs.unlinkSync(file.path);
      }

      uploadedFiles.push(processedFile);
    }

    const urls = uploadedFiles.map(f => "http://localhost:3000/" + f.replace(/\\/g, "/"));
    res.json({ files: urls });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));