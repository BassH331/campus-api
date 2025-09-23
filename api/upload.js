// api/upload.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // disable body parsing so we can handle files
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  console.log('Upload handler called');
  if (req.method !== "POST") {
    console.log('Wrong method:', req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(req);
    console.log('Parsed fields:', fields);
    console.log('Parsed files:', files);

    // Debug: log files.image
    console.log('files.image:', files.image);

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;

    if (!imageFile || !imageFile.filepath) {
      console.error('No image uploaded or missing filepath');
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageBuffer = fs.readFileSync(imageFile.filepath);
    const base64Image = imageBuffer.toString("base64");
    console.log('Image buffer length:', imageBuffer.length);

    const uploadRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      {
        method: "POST",
        body: new URLSearchParams({ image: base64Image }),
      }
    );
    const uploadData = await uploadRes.json();
    console.log('ImgBB response:', uploadData);

    if (!uploadData.success) {
      console.error("ImgBB error:", uploadData);
      return res.status(500).json({ error: "Failed to upload image" });
    }

    return res.status(200).json({
      url: uploadData.data.url,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}