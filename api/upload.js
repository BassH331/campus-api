// api/upload.js
import formidable from "formidable";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // disable default body parsing
  },
};

// Helper to convert formidable file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    file.on("data", (chunk) => chunks.push(chunk));
    file.on("end", () => resolve(Buffer.concat(chunks).toString("base64")));
    file.on("error", reject);
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Error parsing form" });
    }

    const file = files.icon; // Make sure your frontend <input name="icon" />
    if (!file) return res.status(400).json({ error: "No image file provided" });

    try {
      const base64Image = await fileToBase64(file);

      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: "POST",
          body: new URLSearchParams({ image: base64Image }),
        }
      );

      const data = await imgbbResponse.json();

      if (data.success) {
        // Return the hosted image URL
        return res.status(200).json({ url: data.data.url });
      } else {
        console.error("ImgBB upload failed:", data);
        return res.status(500).json({ error: "Upload failed", details: data });
      }
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      return res.status(500).json({ error: "Failed to upload image" });
    }
  });
}