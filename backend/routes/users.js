const express = require('express');
const router = express.Router();
const { rateLimitAI } = require('../middleware/rateLimiter');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  addSkill,
  removeSkill,
  addItem,
  removeItem,
  toggleFavorite,
  getLeaderboard,
  awardPoints
} = require('../controllers/userController');

// Apply rate limiting to getUsers when userId is provided (triggers AI)
router.route('/')
  .get(rateLimitAI(), getUsers)
  .post(createUser);

router.route('/leaderboard')
  .get(getLeaderboard);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/skills')
  .post(addSkill);

router.route('/:id/skills/:skillId')
  .delete(removeSkill);

router.route('/:id/items')
  .post(addItem);

router.route('/:id/items/:itemId')
  .delete(removeItem);

router.route('/:id/favorite/:targetId')
  .post(toggleFavorite);

router.route('/:id/award-points')
  .post(awardPoints);

module.exports = router;
