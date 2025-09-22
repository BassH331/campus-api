// routes/buildingRoutes.js
const express = require('express');
const {
  getAllBuildings,
  getBuildingById,
  createBuilding,
  updateBuilding,
  deleteBuilding
} = require('../controllers/buildingsController'); // Make sure this points to the upgraded controller

const router = express.Router();

// READ all buildings
router.get('/', getAllBuildings);

// READ single building by ID
router.get('/:id', getBuildingById);

// CREATE a new building
router.post('/', createBuilding);

// UPDATE a building by ID
router.put('/:id', updateBuilding);

// DELETE a building by ID
router.delete('/:id', deleteBuilding);

module.exports = router;
