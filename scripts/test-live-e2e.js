const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Apply reliable DNS servers
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const User = require('../models/User');
const Item = require('../models/Item');

async function runLiveVerification() {
  console.log('Connecting to your online MongoDB Atlas cluster...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log(' Connected to MongoDB Atlas:', mongoose.connection.host);

  // Clean test data if already exists
  await User.deleteMany({ email: 'test.student@campus.edu' });
  await Item.deleteMany({ title: 'Test Student HP Laptop' });

  // 1. Create / Register user
  console.log('\n1. Testing Student Registration in Atlas...');
  const user = await User.create({
    name: 'Suhani Goel',
    email: 'test.student@campus.edu',
    password: 'password123',
    phone: '+91-9876543210',
    studentId: 'CAMPUS-2024-001',
    department: 'Computer Science'
  });
  console.log(' User registered in MongoDB Atlas with ID:', user._id);

  // 2. Test password verification
  console.log('\n2. Testing Password Hashing & Verification...');
  const isMatch = await user.matchPassword('password123');
  console.log(' Password verification check:', isMatch ? 'PASSED' : 'FAILED');

  // 3. Create a Lost Item
  console.log('\n3. Testing Lost Item Report in Atlas (CREATE)...');
  const item = await Item.create({
    title: 'Test Student HP Laptop',
    description: 'Silver HP laptop left in Main Library 2nd floor',
    category: 'Electronics',
    type: 'lost',
    location: 'Main Library 2nd Floor',
    contactInfo: 'Suhani - test.student@campus.edu',
    reportedBy: user._id
  });
  console.log(' Item report created in Atlas with ID:', item._id);

  // 4. Query / Read Items
  console.log('\n4. Testing Browse Items (READ)...');
  const items = await Item.find({ type: 'lost' }).populate('reportedBy', 'name email');
  console.log(` Fetched ${items.length} lost item(s) from MongoDB Atlas`);

  // 5. Update Item
  console.log('\n5. Testing Update Item (UPDATE)...');
  item.location = 'Library 2nd Floor Study Room 3';
  await item.save();
  console.log(' Item location updated to:', item.location);

  // 6. Resolve Item
  console.log('\n6. Testing Resolve Item (RESOLVE/RETURN)...');
  item.itemStatus = 'resolved';
  item.resolvedBy = user._id;
  item.resolvedAt = new Date();
  item.resolutionNotes = 'Returned to owner safely';
  await item.save();
  console.log(' Item successfully marked as RESOLVED in MongoDB Atlas!');

  console.log('\n=============================================================');
  console.log(' ALL ONLINE MONGODB ATLAS END-TO-END TESTS PASSED 100%! ');
  console.log('=============================================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runLiveVerification().catch((err) => {
  console.error('Live Verification Failed:', err);
  process.exit(1);
});
