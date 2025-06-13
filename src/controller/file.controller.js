const path = require("path");
const fs = require("fs").promises;
const busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");


// Define upload directories
const BASE_UPLOAD_DIR = path.join(__dirname, "../../public/uploaded_files");
const IMAGE_UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, "images");
const VIDEO_UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, "video");
const MODEL_UPLOAD_DIR = path.join(BASE_UPLOAD_DIR, "3d-model");

// Ensure upload directories exist
async function ensureUploadDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error(`Error creating directory ${dir}:`, err);
  }
}

const uploadImages = async (req, res) => {
  try {
    await ensureUploadDir(IMAGE_UPLOAD_DIR);
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: 5 * 1024 * 1024 },
    }); // 5MB per file
    const allowedMimetypes = ["image/jpeg", "image/png", "image/gif"];
    const savedFiles = [];

    bb.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!allowedMimetypes.includes(mimeType)) {
        file.resume(); // Discard file
        savedFiles.push({
          filename,
          error: "Invalid file type. Only JPEG, PNG, and GIF are allowed.",
        });
        return;
      }

      const uniqueFilename = `${uuidv4()}${path.extname(filename)}`;
      const savePath = path.join(IMAGE_UPLOAD_DIR, uniqueFilename);
      const writeStream = require("fs").createWriteStream(savePath);

      let uploadedBytes = 0;
      const totalSize = req.headers["content-length"] || 5 * 1024 * 1024; // fallback to 5MB if unknown

      file.on("data", (data) => {
        uploadedBytes += data.length;
        const percent = ((uploadedBytes / totalSize) * 100).toFixed(2);
        process.stdout.write(`Uploading ${filename}: ${percent}%\r`);
      });

      file.pipe(writeStream);

      file.on("limit", () => {
        savedFiles.push({ filename, error: "File size exceeds 5MB limit." });
      });

      file.on("end", () => {
        console.log(`Finished uploading ${filename}`);
        savedFiles.push({ filename, path: savePath });
      });
    });

    bb.on("error", (err) => {
      console.error("Busboy error:", err);
      res.status(500).json({ error: "File upload failed." });
    });

    bb.on("finish", () => {
      const errors = savedFiles.filter((file) => file.error);
      if (savedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ message: "Some files failed to upload", files: savedFiles });
      }
      res
        .status(200)
        .json({ message: "Images uploaded successfully", files: savedFiles });
    });

    req.pipe(bb);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const uploadVideo = async (req, res) => {
  try {
    await ensureUploadDir(VIDEO_UPLOAD_DIR);
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: 50 * 1024 * 1024 },
    }); // 50MB per file
    const allowedMimetypes = ["video/mp4", "video/mpeg", "video/webm"];
    const savedFiles = [];

    bb.on("file", (fieldname, file, info) => {
      const { filename, mimeType } = info;

      if (!allowedMimetypes.includes(mimeType)) {
        file.resume(); // Discard file
        savedFiles.push({
          filename,
          error: "Invalid file type. Only MP4, MPEG, and WebM are allowed.",
        });
        return;
      }

      const uniqueFilename = `${uuidv4()}${path.extname(filename)}`;
      const savePath = path.join(VIDEO_UPLOAD_DIR, uniqueFilename);
      const writeStream = require("fs").createWriteStream(savePath);

      let uploadedBytes = 0;
      const totalSize = req.headers["content-length"] || 50 * 1024 * 1024; // fallback to 50MB if not known

      file.on("data", (chunk) => {
        uploadedBytes += chunk.length;
        const percent = ((uploadedBytes / totalSize) * 100).toFixed(2);
        process.stdout.write(`Uploading ${filename}: ${percent}%\r`);
      });

      file.pipe(writeStream);

      file.on("limit", () => {
        savedFiles.push({ filename, error: "File size exceeds 50MB limit." });
      });

      file.on("end", () => {
        console.log(`\nFinished uploading ${filename}`);
        savedFiles.push({ filename, path: savePath });
      });
    });

    bb.on("error", (err) => {
      console.error("Busboy error:", err);
      res.status(500).json({ error: "File upload failed." });
    });

    bb.on("finish", () => {
      const errors = savedFiles.filter((file) => file.error);
      if (savedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ message: "Some files failed to upload", files: savedFiles });
      }
      res
        .status(200)
        .json({ message: "Videos uploaded successfully", files: savedFiles });
    });

    req.pipe(bb);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

const upload3DModel = async (req, res) => {
  try {
    await ensureUploadDir(MODEL_UPLOAD_DIR);
    const bb = busboy({
      headers: req.headers,
      limits: { fileSize: 100 * 1024 * 1024 },
    }); // 100MB per file
    const allowedExtensions = [".gltf", ".glb", ".obj", ".fbx"];
    const savedFiles = [];

    bb.on("file", (fieldname, file, info) => {
      const { filename } = info;
      const ext = path.extname(filename).toLowerCase();

      if (!allowedExtensions.includes(ext)) {
        file.resume(); // Discard file
        savedFiles.push({
          filename,
          error: "Invalid file type. Only GLTF, GLB, OBJ, and FBX are allowed.",
        });
        return;
      }

      const uniqueFilename = `${uuidv4()}${ext}`;
      const savePath = path.join(MODEL_UPLOAD_DIR, uniqueFilename);
      const writeStream = require("fs").createWriteStream(savePath);

      let uploadedBytes = 0;
      const estimatedTotalSize =
        req.headers["content-length"] || 100 * 1024 * 1024; // fallback if size is unknown

      file.on("data", (chunk) => {
        uploadedBytes += chunk.length;
        const percent = ((uploadedBytes / estimatedTotalSize) * 100).toFixed(2);
        process.stdout.write(`Uploading ${filename}: ${percent}%\r`);
      });

      file.pipe(writeStream);

      file.on("limit", () => {
        savedFiles.push({ filename, error: "File size exceeds 100MB limit." });
      });

      file.on("end", () => {
        console.log(`\nFinished uploading ${filename}`);
        savedFiles.push({ filename, path: savePath });
      });
    });

    bb.on("error", (err) => {
      console.error("Busboy error:", err);
      res.status(500).json({ error: "File upload failed." });
    });

    bb.on("finish", () => {
      const errors = savedFiles.filter((file) => file.error);
      if (savedFiles.length === 0) {
        return res.status(400).json({ error: "No files uploaded." });
      }
      if (errors.length > 0) {
        return res
          .status(400)
          .json({ message: "Some files failed to upload", files: savedFiles });
      }
      res.status(200).json({
        message: "3D Models uploaded successfully",
        files: savedFiles,
      });
    });

    req.pipe(bb);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};


const showImages = async (req, res) => {
  try {
    console.log("Request to show images received");

    // Define the image directory path
    const imageDir = path.join(__dirname, "../../public/uploaded_files/images");
    console.log("Image directory path:", imageDir);

    // Read files from the directory
    const files = await fs.readdir(imageDir);

    // Filter for image files
    const imageFiles = files.filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    console.log("Filtered image files:", imageFiles);

    if (!imageFiles.length) {
      return res.status(404).json({ error: "No images found" });
    }

    // Convert images to Base64
    const imagesBase64 = [];
    for (const file of imageFiles) {
      const filePath = path.join(imageDir, file);
      const imageData = await fs.readFile(filePath);
      const base64 = imageData.toString("base64");
      const ext = path.extname(file).slice(1).toLowerCase();
      const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
      imagesBase64.push({filename: file, image: `data:${mimeType};base64,${base64}` });
    }

    res.json({ images: imagesBase64 });
  } catch (error) {
    console.error("Error showing images:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const showImageByName = async (req, res) => {
  console.log("Request to showbyname image received");
  try {
    const rawImageName = req.params["image_name"];
    const imageName = path.basename(rawImageName); // prevent path traversal
    console.log("Image name parameter:", imageName);

    const imageDir = path.join(__dirname, "../../public/uploaded_files/images");
    const imagePath = path.join(imageDir, imageName);

    if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(imageName)) {
      return res.status(400).json({ error: "Unsupported file format" });
    }

    try {
      await fs.access(imagePath);
    } catch (err) {
      return res.status(404).json({ error: "Image not found" });
    }

    const imageData = await fs.readFile(imagePath);
    const ext = path.extname(imageName).slice(1).toLowerCase();
    const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const base64 = imageData.toString("base64");

    res.json({
      image: `data:${mimeType};base64,${base64}`,
    });
  } catch (error) {
    console.error("Error showing image:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  uploadImages,
  uploadVideo,
  upload3DModel,
  showImages,
  showImageByName,
};

// // Upload Controllers
// const uploadImages = async (req, res) => {
//   try {
//     await ensureUploadDir(IMAGE_UPLOAD_DIR);
//     const bb = busboy({ headers: req.headers, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB per file
//     const allowedMimetypes = ["image/jpeg", "image/png", "image/gif"];
//     const savedFiles = [];

//     bb.on("file", (fieldname, file, info) => {
//       const { filename, mimeType } = info;

//       if (!allowedMimetypes.includes(mimeType)) {
//         file.resume(); // Discard file
//         savedFiles.push({ filename, error: "Invalid file type. Only JPEG, PNG, and GIF are allowed." });
//         return;
//       }

//       const uniqueFilename = `${uuidv4()}${path.extname(filename)}`;
//       const savePath = path.join(IMAGE_UPLOAD_DIR, uniqueFilename);

//       file.pipe(require("fs").createWriteStream(savePath));
//       savedFiles.push({ filename, path: savePath });

//       file.on("limit", () => {
//         savedFiles.push({ filename, error: "File size exceeds 5MB limit." });
//       });
//     });

//     bb.on("error", (err) => {
//       console.error("Busboy error:", err);
//       res.status(500).json({ error: "File upload failed." });
//     });

//     bb.on("finish", () => {
//       const errors = savedFiles.filter((file) => file.error);
//       if (savedFiles.length === 0) {
//         return res.status(400).json({ error: "No files uploaded." });
//       }
//       if (errors.length > 0) {
//         return res.status(400).json({ message: "Some files failed to upload", files: savedFiles });
//       }
//       res.status(200).json({ message: "Images uploaded successfully", files: savedFiles });
//     });

//     req.pipe(bb);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

// const uploadVideo = async (req, res) => {
//   try {
//     await ensureUploadDir(VIDEO_UPLOAD_DIR);
//     const bb = busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB per file
//     const allowedMimetypes = ["video/mp4", "video/mpeg", "video/webm"];
//     const savedFiles = [];

//     bb.on("file", (fieldname, file, info) => {
//       const { filename, mimeType } = info;

//       if (!allowedMimetypes.includes(mimeType)) {
//         file.resume(); // Discard file
//         savedFiles.push({ filename, error: "Invalid file type. Only MP4, MPEG, and WebM are allowed." });
//         return;
//       }

//       const uniqueFilename = `${uuidv4()}${path.extname(filename)}`;
//       const savePath = path.join(VIDEO_UPLOAD_DIR, uniqueFilename);

//       file.pipe(require("fs").createWriteStream(savePath));
//       savedFiles.push({ filename, path: savePath });

//       file.on("limit", () => {
//         savedFiles.push({ filename, error: "File size exceeds 50MB limit." });
//       });
//     });

//     bb.on("error", (err) => {
//       console.error("Busboy error:", err);
//       res.status(500).json({ error: "File upload failed." });
//     });

//     bb.on("finish", () => {
//       const errors = savedFiles.filter((file) => file.error);
//       if (savedFiles.length === 0) {
//         return res.status(400).json({ error: "No files uploaded." });
//       }
//       if (errors.length > 0) {
//         return res.status(400).json({ message: "Some files failed to upload", files: savedFiles });
//       }
//       res.status(200).json({ message: "Videos uploaded successfully", files: savedFiles });
//     });

//     req.pipe(bb);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };

// const upload3DModel = async (req, res) => {
//   try {
//     await ensureUploadDir(MODEL_UPLOAD_DIR);
//     const bb = busboy({ headers: req.headers, limits: { fileSize: 100 * 1024 * 1024 } }); // 100MB per file
//     const allowedExtensions = [".gltf", ".glb", ".obj", ".fbx"];
//     const savedFiles = [];

//     bb.on("file", (fieldname, file, info) => {
//       const { filename } = info;
//       const ext = path.extname(filename).toLowerCase();

//       if (!allowedExtensions.includes(ext)) {
//         file.resume(); // Discard file
//         savedFiles.push({ filename, error: "Invalid file type. Only GLTF, GLB, OBJ, and FBX are allowed." });
//         return;
//       }

//       const uniqueFilename = `${uuidv4()}${ext}`;
//       const savePath = path.join(MODEL_UPLOAD_DIR, uniqueFilename);

//       file.pipe(require("fs").createWriteStream(savePath));
//       savedFiles.push({ filename, path: savePath });

//       file.on("limit", () => {
//         savedFiles.push({ filename, error: "File size exceeds 100MB limit." });
//       });
//     });

//     bb.on("error", (err) => {
//       console.error("Busboy error:", err);
//       res.status(500).json({ error: "File upload failed." });
//     });

//     bb.on("finish", () => {
//       const errors = savedFiles.filter((file) => file.error);
//       if (savedFiles.length === 0) {
//         return res.status(400).json({ error: "No files uploaded." });
//       }
//       if (errors.length > 0) {
//         return res.status(400).json({ message: "Some files failed to upload", files: savedFiles });
//       }
//       res.status(200).json({ message: "3D Models uploaded successfully", files: savedFiles });
//     });

//     req.pipe(bb);
//   } catch (err) {
//     console.error("Upload error:", err);
//     res.status(500).json({ error: "Internal server error." });
//   }
// };
