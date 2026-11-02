const Item = require('../models/Item');

/**
 * @desc    Create a new lost or found item report
 * @route   POST /api/items
 * @access  Private
 */
const createItem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      type,
      location,
      date,
      contactInfo,
      imageUrl
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !type || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, category, type, and location'
      });
    }

    // Default contactInfo to user email/phone if omitted
    const effectiveContactInfo =
      contactInfo && contactInfo.trim() !== ''
        ? contactInfo.trim()
        : req.user.phone
        ? `${req.user.name} - ${req.user.phone}`
        : `${req.user.name} - ${req.user.email}`;

    const item = await Item.create({
      title,
      description,
      category,
      type: type.toLowerCase(),
      location,
      date: date || Date.now(),
      contactInfo: effectiveContactInfo,
      imageUrl: imageUrl || '',
      reportedBy: req.user._id
    });

    // Populate reporter details
    await item.populate('reportedBy', 'name email phone studentId department');

    res.status(201).json({
      success: true,
      message: `${type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all lost and found items (with filtering, search, and pagination)
 * @route   GET /api/items
 * @access  Public
 */
const getItems = async (req, res, next) => {
  try {
    const {
      type,
      category,
      status,
      search,
      location,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    // Filter by type ('lost' or 'found')
    if (type) {
      query.type = type.toLowerCase();
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by itemStatus ('open', 'claimed', 'resolved')
    if (status) {
      query.itemStatus = status.toLowerCase();
    }

    // Search by title or description or location via Regex
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Specific location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    // Pagination setup
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup (default: latest first)
    let sortBy = '-createdAt';
    if (sort) {
      sortBy = sort.split(',').join(' ');
    }

    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .populate('reportedBy', 'name email phone studentId department')
      .populate('resolvedBy', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single item by ID
 * @route   GET /api/items/:id
 * @access  Public
 */
const getItemById = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('reportedBy', 'name email phone studentId department')
      .populate('resolvedBy', 'name email phone');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with id: ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get items reported by the currently logged-in user
 * @route   GET /api/items/my-items
 * @access  Private
 */
const getMyItems = async (req, res, next) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id })
      .populate('resolvedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an item report
 * @route   PUT /api/items/:id
 * @access  Private (Reporter or Admin only)
 */
const updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with id: ${req.params.id}`
      });
    }

    // Verify ownership or admin role
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this item report'
      });
    }

    // Update allowed fields
    const fieldsToUpdate = [
      'title',
      'description',
      'category',
      'type',
      'location',
      'date',
      'itemStatus',
      'contactInfo',
      'imageUrl'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    const updatedItem = await item.save();
    await updatedItem.populate('reportedBy', 'name email phone studentId department');

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark an item as resolved or claimed
 * @route   PATCH /api/items/:id/resolve
 * @access  Private
 */
const resolveItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with id: ${req.params.id}`
      });
    }

    // Set resolution fields
    item.itemStatus = req.body.status || 'resolved';
    item.resolvedBy = req.user._id;
    item.resolvedAt = new Date();
    if (req.body.resolutionNotes) {
      item.resolutionNotes = req.body.resolutionNotes;
    }

    const resolvedItem = await item.save();
    await resolvedItem.populate('reportedBy', 'name email phone');
    await resolvedItem.populate('resolvedBy', 'name email phone');

    res.status(200).json({
      success: true,
      message: `Item status updated to ${item.itemStatus}`,
      data: resolvedItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an item report
 * @route   DELETE /api/items/:id
 * @access  Private (Reporter or Admin only)
 */
const deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Item not found with id: ${req.params.id}`
      });
    }

    // Verify ownership or admin role
    const isOwner = item.reportedBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this item report'
      });
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Item report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get CampusFind dashboard summary statistics
 * @route   GET /api/items/stats
 * @access  Public
 */
const getItemStats = async (req, res, next) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalLost = await Item.countDocuments({ type: 'lost' });
    const totalFound = await Item.countDocuments({ type: 'found' });
    const resolvedCount = await Item.countDocuments({ itemStatus: 'resolved' });
    const openCount = await Item.countDocuments({ itemStatus: 'open' });

    res.status(200).json({
      success: true,
      data: {
        totalItems,
        totalLost,
        totalFound,
        openCount,
        resolvedCount
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  getMyItems,
  updateItem,
  resolveItem,
  deleteItem,
  getItemStats
};
