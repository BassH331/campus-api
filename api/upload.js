// api/upload.js
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false, // disable body parsing so we can handle files
  },
};

export default async function handler(req, res) {
  console.log('Upload handler called');
  if (req.method !== "POST") {
    console.log('Wrong method:', req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image provided" });
    }

    const uploadRes = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      {
        method: "POST",
        body: new URLSearchParams({ image }),
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