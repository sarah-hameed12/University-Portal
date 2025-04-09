const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
const mongoURI = "mongodb://localhost:27017/mydatabase";
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:5000");
//   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   next();
// });

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const conn = mongoose.connection;
let gfs, bucket;

conn.once("open", () => {
  bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
  console.log("GridFS Initialized");
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const readableStream = new Readable();
  readableStream.push(req.file.buffer);
  readableStream.push(null);

  const uploadStream = bucket.openUploadStream(req.file.originalname);

  readableStream
    .pipe(uploadStream)
    .on("error", (err) => res.status(500).json({ error: err.message }))
    .on("finish", () =>
      res.json({
        message: "File uploaded successfully",
        fileId: uploadStream.id,
      })
    );
});
app.get("/files/filenames", async (req, res) => {
  try {
    const files = await bucket.find({}).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: "No files found" });
    }

    const fileList = files.map((file) => ({
      filename: file.filename,
      contentType: file.contentType,
    }));

    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download File by Filename
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Escapes special regex characters
}

app.get("/files/:filename", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: "GridFS not initialized yet" });
    }

    const filename = decodeURIComponent(req.params.filename);
    console.log("Requested filename:", filename);
    let filename1 = "";
    for (let i = 1; i < filename.length; i++) {
      filename1 += filename[i];
    }

    console.log(filename1);
    const allFiles = await bucket.find({}).toArray();
    console.log(
      "Stored filenames:",
      allFiles.map((f) => f.filename)
    );

    const files = await bucket.find({ filename: filename1 }).toArray();
    // console.log(files);

    if (!files || files.length === 0) {
      return res.status(404).json({ error: "File not found" });
    }

    const file = files[0];
    console.log("Found file:", file);

    const downloadStream = bucket.openDownloadStream(file._id);

    downloadStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({ error: "Error streaming file" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ error: error.message });
  }
});

// app.get("/files/:filename", async (req, res) => {
//   try {
//     if (!bucket) {
//       return res.status(500).json({ error: "GridFS not initialized yet" });
//     }

//     const filename = decodeURIComponent(req.params.filename);
//     console.log("Requested filename:", filename);
//     let filename1 = "";
//     for (let i = 1; i < filename.length; i++) {
//       filename1 += filename[i];
//     }
//     console.log(filename1);
//     // Log all filenames to debug
//     const allFiles = await bucket.find({}).toArray();
//     console.log(
//       "Stored filenames:",
//       allFiles.map((f) => f.filename)
//     );

//     // Search using regex to avoid encoding issues
//     const files = await bucket
//       .find({ filename: { $regex: new RegExp({ filename }, "i") } })
//       .toArray();
//     if (!files || files.length === 0) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     const file = files[0]; // Get first matching file

//     res.setHeader("Content-Type", file.contentType);

//     // Stream file using _id instead of filename
//     const downloadStream = bucket.openDownloadStream(file._id);

//     downloadStream.on("error", (err) => {
//       console.error("Stream error:", err);
//       res.status(500).json({ error: "Error streaming file" });
//     });

//     downloadStream.pipe(res);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// check this
// ye dono daaldo
// app.get("/files/filenames", async (req, res) => {
//   try {
//     const files = await bucket.find({}).toArray();
//     if (!files || files.length === 0) {
//       return res.status(404).json({ error: "No files found" });
//     }

//     const fileList = files.map((file) => ({
//       filename: file.filename,
//       contentType: file.contentType,
//     }));

//     res.json(fileList);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
//   if (!bucket) {
//     return res.status(500).json({ error: "GridFS not initialized yet" });
//   }
// });
app.get("/files/:filename", async (req, res) => {
  try {
    if (!bucket) {
      return res.status(500).json({ error: "GridFS not initialized yet" });
    }

    const filename = decodeURIComponent(req.params.filename); //
    const file = await bucket.findOne({ filename });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    res.setHeader("Content-Type", file.contentType);

    const downloadStream = bucket.openDownloadStreamByName(filename);

    downloadStream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).json({ error: "Error streaming file" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// app.get("/files/:filename", async (req, res) => {
//   try {
//     const filename = req.params.filename;
//     const file = await bucket.find({ filename }).toArray();

//     if (!file || file.length === 0) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     res.setHeader("Content-Type", file[0].contentType);

//     const downloadStream = bucket.openDownloadStreamByName(filename);
//     downloadStream.pipe(res);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.listen(5000, () => console.log("Server running on port 5000"));
