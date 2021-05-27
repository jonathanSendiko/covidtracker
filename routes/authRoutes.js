const { Router } = require("express");
const authController = require("../controllers/authController");
const { checkAuth } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = Router();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("file format salah"), false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

//route
router.get("/dashboard", checkAuth, authController.dashboard_get);
router.get("/signup", checkAuth, authController.signup_get);
router.post("/signup", checkAuth, authController.signup_post);
router.get("/login", authController.login_get);
router.post("/login", authController.login_post);
router.get("/logout", authController.logout_get);
router.post("/password", checkAuth, authController.password_post);
router.get("/device", checkAuth, authController.device_get);
router.get("/users", checkAuth, authController.users_get);
router.get("/maps", checkAuth, authController.maps_get);
router.get("/maps/log", checkAuth, authController.log_get);
router.get("/articles", checkAuth, authController.articles_get);
router.post("/articles", checkAuth, authController.articles_post);
router.get("/articles/add", checkAuth, authController.addArticles_get);
router.get("/articles/edit", checkAuth, authController.editArticles_get);
router.post("/articles/edit", checkAuth, authController.editArticles_post);
router.get("/articles/delete", checkAuth, authController.deleteArticles_get);
router.post(
  "/info",
  checkAuth,
  upload.single("image"),
  authController.info_post
);
router.get("/info/delete", checkAuth, authController.deleteInfo_get);
router.get("/users/edit", checkAuth, authController.edit_get);
router.post("/users/edit", checkAuth, authController.edit_post);
router.get("/notification", checkAuth, authController.notif_get);
router.get("/notification/news", authController.notifnews_get);
router.post("/notification", checkAuth, authController.notif_post);
router.get("/users/delete", checkAuth, authController.delete_get);
router.get("/profile", checkAuth, authController.profile_get);

module.exports = router;
