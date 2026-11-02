const express = require('express');
const router = express.Router();
const {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  resolveItem,
  deleteItem,
  getItemStats
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

// Public route to view stats
router.get('/stats', getItemStats);

// Route to get items belonging to current authenticated student
router.get('/my-items', protect, getMyItems);

// CRUD routes for items
router
  .route('/')
  .get(getItems)
  .post(protect, createItem);

router
  .route('/:id')
  .get(getItemById)
  .put(protect, updateItem)
  .delete(protect, deleteItem);

// Route to mark item as resolved/claimed
router.patch('/:id/resolve', protect, resolveItem);

module.exports = router;
