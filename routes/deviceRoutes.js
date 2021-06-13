const { Router } = require("express");
const deviceController = require("../controllers/deviceController");
const { checkAuth } = require("../middleware/authMiddleware");

const router = Router();

router.get("/", checkAuth, deviceController.device_get);
router.post("/register", checkAuth, deviceController.register_post);
router.get("/position", deviceController.position_get);
router.get("/log", checkAuth, deviceController.log_get);
router.post("/log", deviceController.log_post);
router.get("/unregister", checkAuth, deviceController.unregister_get);
router.post("/update", checkAuth, deviceController.update_post);
router.get("/delete", checkAuth, deviceController.delete_get);
router.post("/add", checkAuth, deviceController.add_post);
router.post("/addPulse", checkAuth, deviceController.pulse_post);
// router.get('/sensor', deviceController.sensor_get);

module.exports = router;
