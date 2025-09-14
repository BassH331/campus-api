// api/upload.js
import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // disable body parsing (we’ll use formidable)
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

      const file = files.image;
      if (!file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      // Read file as base64
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64Image = fileBuffer.toString("base64");

      // Upload to ImgBB
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: new URLSearchParams({
            image: base64Image,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Return the hosted image link
        return res.status(200).json({ url: data.data.url });
      } else {
        return res.status(500).json({ error: "Upload failed", details: data });
      }
    });
  } catch (err) {
    console.error("Error uploading image:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}