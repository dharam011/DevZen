const express = require("express")

const aiController= require("../controllers/ai.controller")
 
const router = express.Router();

router.post("/get-review",aiController.getReview )
router.post("/get-output", aiController.getOutput)
router.post("/chat", aiController.chat)





module.exports = router