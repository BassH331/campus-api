// api/upload.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // disable body parsing so we can handle files
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parse error:", err);
        return res.status(500).json({ error: "Error parsing form" });
      }

      if (!files.image) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      // Read file + convert to base64
      const imageBuffer = fs.readFileSync(files.image.filepath);
      const base64Image = imageBuffer.toString("base64");

      // Upload to ImgBB
      const uploadRes = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
        {
          method: "POST",
          body: new URLSearchParams({ image: base64Image }),
        }
      );
      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        console.error("ImgBB error:", uploadData);
        return res.status(500).json({ error: "Failed to upload image" });
      }

      return res.status(200).json({
        url: uploadData.data.url,
      });
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}