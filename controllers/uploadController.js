import fetch from "node-fetch";
import FormData from "form-data";

/**
 * Upload image to ImgBB
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageFile = req.files.image;

    // Convert to base64 (ImgBB API requires it)
    const base64Image = imageFile.data.toString("base64");

    const form = new FormData();
    form.append("image", base64Image);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_KEY}`,
      {
        method: "POST",
        body: form,
      }
    );

    const data = await response.json();

    if (!data.success) {
      return res.status(500).json({
        error: "ImgBB upload failed",
        details: data,
      });
    }

    return res.json({
      url: data.data.url,
      thumb: data.data.thumb.url,
      deleteUrl: data.data.delete_url, // optional: ImgBB provides this
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
