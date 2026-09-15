require('dotenv').config();

const { connectDB } = require('../config/db');
const User = require('../models/User');

const seedWarden = async () => {
  const email = (process.env.WARDEN_EMAIL || 'warden@hostel.edu').trim().toLowerCase();
  const password = process.env.WARDEN_PASSWORD || 'ChangeThisPassword123';
  const name = process.env.WARDEN_NAME || 'Hostel Warden';

  if (password.length < 8) {
    throw new Error('WARDEN_PASSWORD must be at least 8 characters long.');
  }

  await connectDB();

  const existingWarden = await User.findOne({ email });

  if (existingWarden) {
    existingWarden.name = name;
    existingWarden.role = 'warden';
    existingWarden.password = password;
    await existingWarden.save();
    console.log(`Updated warden account: ${email}`);
  } else {
    await User.create({
      name,
      email,
      password,
      role: 'warden',
      phone: '9999999999',
      gender: 'Other',
    });
    console.log(`Created warden account: ${email}`);
  }

  process.exit(0);
};

seedWarden().catch((error) => {
  console.error(`Warden seed failed: ${error.message}`);
  process.exit(1);
});
