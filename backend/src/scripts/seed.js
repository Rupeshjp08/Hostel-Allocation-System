const path = require('path');
const dns = require('dns');

// Configure fallback DNS for environments where SRV records fail
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (_) {}

require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI missing in backend/.env');
  process.exit(1);
}

// Standard hostel definitions (Boys, Girls, and Co-ed)
const hostelDefs = [
  {
    name: 'Kaveri Boys Hostel',
    type: 'Boys',
    location: 'North Campus, Block A',
    description: 'Modern hostel for male students with sports facilities and WiFi.',
    totalCapacity: 120,
    isActive: true,
  },
  {
    name: 'Ganga Boys Hostel',
    type: 'Boys',
    location: 'East Campus, Block D',
    description: 'Well-maintained hostel for male students with study rooms and 24/7 security.',
    totalCapacity: 60,
    isActive: true,
  },
  {
    name: 'Saraswati Girls Hostel',
    type: 'Girls',
    location: 'South Campus, Block B',
    description: 'Secure hostel for female students with 24/7 warden on duty.',
    totalCapacity: 100,
    isActive: true,
  },
  {
    name: 'Lakshmi Girls Hostel',
    type: 'Girls',
    location: 'West Campus, Block E',
    description: 'Comfortable accommodation for female students with modern amenities.',
    totalCapacity: 80,
    isActive: true,
  },
  {
    name: 'Unity Co-ed Hostel',
    type: 'Co-ed',
    location: 'Central Campus, Block C',
    description: 'Co-educational hostel with separate wings and shared common areas.',
    totalCapacity: 80,
    isActive: true,
  },
];

const roomTypeCapacity = {
  'Single Sharing': 1,
  'Double Sharing': 2,
  'Triple Sharing': 3,
  'Four Sharing': 4,
};

const roomDefs = [
  { block: 'Block A', floor: 0, num: '001', type: 'Single Sharing' },
  { block: 'Block A', floor: 0, num: '002', type: 'Double Sharing' },
  { block: 'Block A', floor: 0, num: '003', type: 'Double Sharing' },
  { block: 'Block A', floor: 1, num: '101', type: 'Triple Sharing' },
  { block: 'Block A', floor: 1, num: '102', type: 'Four Sharing' },
  { block: 'Block A', floor: 1, num: '103', type: 'Double Sharing' },
  { block: 'Block B', floor: 0, num: '201', type: 'Double Sharing' },
  { block: 'Block B', floor: 0, num: '202', type: 'Triple Sharing' },
  { block: 'Block B', floor: 1, num: '301', type: 'Four Sharing' },
  { block: 'Block B', floor: 1, num: '302', type: 'Double Sharing' },
];

async function seed() {
  console.log('[Seed] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log('[Seed] Connected successfully.');

  // 1. Ensure Warden account exists
  const wardenEmail = (process.env.WARDEN_EMAIL || 'warden@hostel.edu').trim().toLowerCase();
  const wardenPassword = process.env.WARDEN_PASSWORD || 'ChangeThisPassword123';
  const wardenName = process.env.WARDEN_NAME || 'Hostel Warden';

  const existingWarden = await User.findOne({ email: wardenEmail });
  if (!existingWarden) {
    await User.create({
      name: wardenName,
      email: wardenEmail,
      password: wardenPassword,
      role: 'warden',
      phone: '9999999999',
      gender: 'Other',
    });
    console.log(`[Seed] Warden account created: ${wardenEmail}`);
  } else {
    console.log(`[Seed] Warden account exists: ${wardenEmail}`);
  }

  // 2. Upsert standard hostels without deleting existing ones
  for (const def of hostelDefs) {
    let hostel = await Hostel.findOne({ name: def.name });

    if (!hostel) {
      hostel = await Hostel.create(def);
      console.log(`[Seed] Created hostel: ${hostel.name} (${hostel.type})`);
    } else {
      hostel.type = def.type;
      hostel.location = def.location;
      hostel.description = def.description;
      hostel.totalCapacity = def.totalCapacity;
      hostel.isActive = def.isActive;
      await hostel.save();
      console.log(`[Seed] Updated hostel: ${hostel.name} (${hostel.type})`);
    }

    // 3. Upsert rooms for this hostel
    const existingRoomsCount = await Room.countDocuments({ hostel: hostel._id });
    if (existingRoomsCount === 0) {
      const words = hostel.name.split(' ').filter((w) => w.length > 1);
      const prefix = words
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);

      let createdCount = 0;
      for (const r of roomDefs) {
        const roomNumber = `${prefix}-${r.num}`;
        try {
          await Room.create({
            hostel: hostel._id,
            roomNumber,
            block: r.block,
            floor: r.floor,
            roomType: r.type,
            capacity: roomTypeCapacity[r.type],
            status: 'Active',
          });
          createdCount++;
        } catch (e) {
          if (e.code !== 11000) {
            console.error(`[Seed] Room create error: ${e.message}`);
          }
        }
      }
      console.log(`[Seed]   Created ${createdCount} rooms for ${hostel.name}`);
    } else {
      console.log(`[Seed]   Hostel ${hostel.name} already has ${existingRoomsCount} rooms - preserved.`);
    }
  }

  // Summary
  const allHostels = await Hostel.find({ isActive: true });
  const totalRooms = await Room.countDocuments();
  console.log('\n=== SEED SUMMARY ===');
  for (const h of allHostels) {
    const rc = await Room.countDocuments({ hostel: h._id });
    console.log(`  [${h.type}] ${h.name} — ${h.location} (${rc} rooms)`);
  }
  console.log(`Active hostels: ${allHostels.length}`);
  console.log(`Total rooms: ${totalRooms}`);
  console.log('====================\n');

  await mongoose.disconnect();
  console.log('[Seed] Database disconnected cleanly.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] FAILED:', err.message);
  process.exit(1);
});
