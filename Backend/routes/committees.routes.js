const { Router } = require("express");

const {
  getCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  deleteCommittee,
  addMember,
  removeMember,
  updateMember,
} = require("../controllers/committees.controller");

const router = Router();

router.get("/", getCommittees);
router.get("/:id", getCommitteeById);
router.post("/", createCommittee);
router.put("/:id", updateCommittee);
router.delete("/:id", deleteCommittee);
router.post("/:id/members", addMember);
router.delete("/:id/members/:memberId", removeMember);
router.put("/:id/members/:memberId", updateMember);

module.exports = router;
