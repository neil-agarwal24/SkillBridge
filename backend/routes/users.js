const express = require('express');
const router = express.Router();
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

router.route('/')
  .get(getUsers)
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
