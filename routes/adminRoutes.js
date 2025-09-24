const express = require("express");
const {
  getAllAdmins,
  getAdminById,
  getAdminByEmail,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/", getAllAdmins);
router.get("/email/:email", getAdminByEmail); // <--- specific route FIRST
router.get("/:id", getAdminById);             // <--- param route LAST (after specifics)
router.post("/", createAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;
