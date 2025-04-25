const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");

const uploadEndpoint = "http://localhost:5000/upload";
const mainFolderPath = "C:\\Users\\xylic\\Downloads\\courseoutlines";

function getPdfFiles(dir, folderName = "") {
  let files = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.join(folderName, file);

    if (fs.statSync(fullPath).isDirectory()) {
      files = files.concat(getPdfFiles(fullPath, relativePath));
    } else if (file.endsWith(".pdf")) {
      files.push({ fullPath, relativePath });
    }
  });
  return files;
}

async function uploadFile(filePath, relativePath) {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(filePath));

  try {
    const response = await axios.post(uploadEndpoint, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    console.log(`✅ Uploaded: ${relativePath}`);
  } catch (error) {
    console.error(`❌ Failed: ${relativePath} - ${error.message}`);
  }
}

async function uploadAllPdfs() {
  const pdfFiles = getPdfFiles(mainFolderPath);
  console.log(`📂 Found ${pdfFiles.length} PDFs. Uploading...`);

  for (const { fullPath, relativePath } of pdfFiles) {
    await uploadFile(fullPath, relativePath);
  }

  console.log(" Upload Complete!");
}

uploadAllPdfs();
