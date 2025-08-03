const express = require('express');
const cors = require('cors');
require('dotenv').config();

const buildingRoutes = require('./routes/buildingRoutes');
const coordinatesRoutes = require('./routes/coordinatesRoutes');
const linksRoutes = require('./routes/linksRoutes');
const routesRoutes = require('./routes/routesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/buildings', buildingRoutes);
app.use('/api/coordinates', coordinatesRoutes);
app.use('/api/links', linksRoutes);
app.use('/api/routes', routesRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
