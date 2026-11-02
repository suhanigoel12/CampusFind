/**
 * CampusFind Backend Test Suite
 * Validates models, schema constraints, hashing, token generation, and route structure.
 */

const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Set dummy JWT secret for testing if not set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_12345';

console.log('====================================================');
console.log(' Running CampusFind Backend Validation & Unit Tests ');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}\n`);
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}\n`);
  }
}

(async () => {
  // Test 1: User Model Loading & Schema validation
  await runAsyncTest('User Model - Schema requires name, email, and password', async () => {
    const User = require('../models/User');
    const userInstance = new User({});
    let error;
    try {
      await userInstance.validate();
    } catch (err) {
      error = err;
    }

    assert(error, 'User with empty fields should trigger validation error');
    assert(error.errors.name, 'Name should be required');
    assert(error.errors.email, 'Email should be required');
    assert(error.errors.password, 'Password should be required');
  });

  // Test 2: User Model Email format validation
  await runAsyncTest('User Model - Rejects invalid email format', async () => {
    const User = require('../models/User');
    const userInstance = new User({
      name: 'John Doe',
      email: 'not-an-email',
      password: 'password123'
    });
    let error;
    try {
      await userInstance.validate();
    } catch (err) {
      error = err;
    }
    assert(error && error.errors.email, 'Invalid email format should fail validation');
  });

  // Test 3: Password comparison method
  await runAsyncTest('User Model - bcrypt matchPassword method works correctly', async () => {
    const User = require('../models/User');
    const plainPassword = 'secureStudentPassword123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    const userInstance = new User({
      name: 'Test Student',
      email: 'test@campus.edu',
      password: hashedPassword
    });

    const isMatch = await userInstance.matchPassword(plainPassword);
    const isMismatch = await userInstance.matchPassword('wrongPassword');

    assert.strictEqual(isMatch, true, 'Correct password should return true');
    assert.strictEqual(isMismatch, false, 'Incorrect password should return false');
  });

  // Test 4: Item Model Loading & Schema validation
  await runAsyncTest('Item Model - Schema requires title, description, category, type, and location', async () => {
    const Item = require('../models/Item');
    const itemInstance = new Item({});
    let error;
    try {
      await itemInstance.validate();
    } catch (err) {
      error = err;
    }

    assert(error, 'Item with empty fields should fail validation');
    assert(error.errors.title, 'Title should be required');
    assert(error.errors.description, 'Description should be required');
    assert(error.errors.category, 'Category should be required');
    assert(error.errors.type, 'Type should be required');
    assert(error.errors.location, 'Location should be required');
  });

  // Test 5: Item Model Category and Type enums
  await runAsyncTest('Item Model - Enforces category and type enums', async () => {
    const Item = require('../models/Item');
    const itemInstance = new Item({
      title: 'Water Bottle',
      description: 'Blue insulated water bottle',
      category: 'InvalidCategory',
      type: 'invalidType',
      location: 'Gymnasium',
      contactInfo: 'student@campus.edu',
      reportedBy: new mongoose.Types.ObjectId()
    });

    let error;
    try {
      await itemInstance.validate();
    } catch (err) {
      error = err;
    }
    assert(error, 'Invalid enums should fail validation');
    assert(error.errors.category, 'Invalid category should be rejected');
    assert(error.errors.type, 'Invalid type should be rejected');
  });

  // Test 6: Item Model valid instance
  await runAsyncTest('Item Model - Accepts valid lost & found attributes with defaults', async () => {
    const Item = require('../models/Item');
    const dummyUserId = new mongoose.Types.ObjectId();
    const itemInstance = new Item({
      title: 'Graphing Calculator',
      description: 'TI-84 Plus CE Silver Edition',
      category: 'Electronics',
      type: 'lost',
      location: 'Math Building Room 102',
      contactInfo: 'math_student@campus.edu',
      reportedBy: dummyUserId
    });

    let error;
    try {
      await itemInstance.validate();
    } catch (err) {
      error = err;
    }
    assert.strictEqual(error, undefined, 'Valid item should not have validation errors');
    assert.strictEqual(itemInstance.itemStatus, 'open', 'Default status should be open');
    assert.strictEqual(itemInstance.type, 'lost');
  });

  // Test 7: JWT generation & verification
  runTest('JWT Authentication - Signing and decoding tokens', () => {
    const userId = '64cfa9b8e1a2b3c4d5e6f7a8';
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    assert(token && typeof token === 'string', 'Token should be a valid string');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, userId, 'Decoded token ID must match original user ID');
  });

  // Test 8: Express routes configuration check
  runTest('Express Setup - Route modules load successfully', () => {
    const authRoutes = require('../routes/authRoutes');
    const itemRoutes = require('../routes/itemRoutes');
    const { notFound, errorHandler } = require('../middleware/errorMiddleware');
    const { protect } = require('../middleware/auth');

    assert(authRoutes, 'Auth routes should load');
    assert(itemRoutes, 'Item routes should load');
    assert.strictEqual(typeof notFound, 'function', 'notFound middleware should be a function');
    assert.strictEqual(typeof errorHandler, 'function', 'errorHandler middleware should be a function');
    assert.strictEqual(typeof protect, 'function', 'protect middleware should be a function');
  });

  console.log('\n====================================================');
  console.log(` Test Results: ${passedTests}/${totalTests} Passed `);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('All backend components and schema validations verified successfully!\n');
    process.exit(0);
  } else {
    console.error('Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
})();
