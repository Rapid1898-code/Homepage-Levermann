const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now

//Show detail Scores for spefific ticker
router.get("/:id", ensureAuth, postsController.detailScore);

router.post("/createPost", upload.single("file"), postsController.createPost);

router.put("/likePost/:id", postsController.likePost);

router.delete("/deletePost/:id", postsController.deletePost);

//Request a ticker for update - put in working queue when does not exist
router.post("/tickerRequest", postsController.tickerRequest);

module.exports = router;
