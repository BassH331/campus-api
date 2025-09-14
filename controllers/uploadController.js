const formidable = require('formidable');
const fs = require('fs');
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');

let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  cachedDb = client.db(process.env.DB_NAME);
  return cachedDb;
}

const uploadImage = async (req, res) => {
  try {
    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Error parsing form' });
      }

      const file = files.icon || files.image; // match frontend input name
      if (!file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      // Read file as base64
      const fileBuffer = fs.readFileSync(file.filepath);
      const base64Image = fileBuffer.toString('base64');

      // Upload to ImgBB
      const imgbbResponse = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
        {
          method: 'POST',
          body: new URLSearchParams({ image: base64Image }),
        }
      );

      const data = await imgbbResponse.json();

      if (!data.success) {
        console.error('ImgBB upload failed:', data);
        return res.status(500).json({ error: 'Upload failed', details: data });
      }

      const imageUrl = data.data.url;

      // Store in MongoDB links collection
      const db = await connectToDatabase();
      const result = await db.collection('links').insertOne({
        name: fields.name || 'Unnamed',
        imageurl: imageUrl,
        createdAt: new Date(),
      });

      res.status(200).json({
        id: result.insertedId,
        url: imageUrl,
      });
    });
  } catch (err) {
    console.error('Error uploading image:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { uploadImage };
