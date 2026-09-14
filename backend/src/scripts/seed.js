require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/User");
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error("ERROR: MONGO_URI missing in backend/.env"); process.exit(1); }

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB connected to:", MONGO_URI);

  // --- 1. Warden ---
  const wardenEmail = (process.env.WARDEN_EMAIL || "warden@hostel.edu").trim().toLowerCase();
  const wardenPassword = process.env.WARDEN_PASSWORD || "ChangeThisPassword123";
  const wardenName = process.env.WARDEN_NAME || "Hostel Warden";
  const warden = await User.findOne({ email: wardenEmail });
  if (!warden) {
    await User.create({ name: wardenName, email: wardenEmail, password: wardenPassword, role: "warden", phone: "9999999999", gender: "Other" });
    console.log("Warden created:", wardenEmail);
  } else { console.log("Warden exists:", wardenEmail); }

  // --- 2. Remove bad test hostels (timestamp-named) ---
  const badHostels = await Hostel.find({ name: { $regex: "Hostel \\d{10,}$" } });
  if (badHostels.length > 0) {
    const badIds = badHostels.map(function(h) { return h._id; });
    await Room.deleteMany({ hostel: { $in: badIds } });
    await Hostel.deleteMany({ _id: { $in: badIds } });
    console.log("Removed " + badHostels.length + " bad test hostel(s) and their rooms");
  }

  // --- 3. Create proper hostels ---
  const hostelDefs = [
    { name: "Kaveri Boys Hostel",     type: "Boys",   location: "North Campus, Block A", description: "Modern hostel for male students with sports facilities and WiFi.",  totalCapacity: 120, isActive: true },
    { name: "Ganga Boys Hostel",      type: "Boys",   location: "East Campus, Block D",  description: "Well-maintained hostel with study rooms and 24/7 security.",        totalCapacity: 60,  isActive: true },
    { name: "Saraswati Girls Hostel", type: "Girls",  location: "South Campus, Block B", description: "Secure hostel for female students with 24/7 warden on duty.",       totalCapacity: 100, isActive: true },
    { name: "Lakshmi Girls Hostel",   type: "Girls",  location: "West Campus, Block E",  description: "Comfortable accommodation for female students with amenities.",      totalCapacity: 80,  isActive: true },
    { name: "Unity Co-ed Hostel",     type: "Co-ed",  location: "Central Campus, Block C", description: "Co-educational hostel with separate wings and shared areas.", totalCapacity: 80,  isActive: true },
  ];

  const roomTypeCapacity = { "Single Sharing": 1, "Double Sharing": 2, "Triple Sharing": 3, "Four Sharing": 4 };
  const roomDefs = [
    { block: "Block A", floor: 0, num: "001", type: "Single Sharing" },
    { block: "Block A", floor: 0, num: "002", type: "Double Sharing" },
    { block: "Block A", floor: 0, num: "003", type: "Double Sharing" },
    { block: "Block A", floor: 1, num: "101", type: "Triple Sharing" },
    { block: "Block A", floor: 1, num: "102", type: "Four Sharing" },
    { block: "Block A", floor: 1, num: "103", type: "Double Sharing" },
    { block: "Block B", floor: 0, num: "201", type: "Double Sharing" },
    { block: "Block B", floor: 0, num: "202", type: "Triple Sharing" },
    { block: "Block B", floor: 1, num: "301", type: "Four Sharing" },
    { block: "Block B", floor: 1, num: "302", type: "Double Sharing" },
  ];

  for (var i = 0; i < hostelDefs.length; i++) {
    var def = hostelDefs[i];
    var hostel = await Hostel.findOne({ name: def.name });
    if (!hostel) {
      hostel = await Hostel.create(def);
      console.log("Created hostel: " + hostel.name + " (" + hostel.type + ")");
    } else {
      hostel.type = def.type; hostel.location = def.location; hostel.description = def.description;
      hostel.totalCapacity = def.totalCapacity; hostel.isActive = def.isActive;
      await hostel.save();
      console.log("Updated hostel: " + hostel.name);
    }

    var existingRooms = await Room.countDocuments({ hostel: hostel._id });
    if (existingRooms > 0) { console.log("  Rooms exist (" + existingRooms + ") - skipping"); continue; }

    var words = hostel.name.split(" ").filter(function(w) { return w.length > 1; });
    var prefix = words.map(function(w) { return w[0]; }).join("").toUpperCase().slice(0, 3);
    var created = 0;
    for (var j = 0; j < roomDefs.length; j++) {
      var r = roomDefs[j];
      try {
        await Room.create({ hostel: hostel._id, roomNumber: prefix + "-" + r.num, block: r.block, floor: r.floor, roomType: r.type, capacity: roomTypeCapacity[r.type], status: "Active" });
        created++;
      } catch(e) { if (e.code !== 11000) { console.error("Room create error:", e.message); } }
    }
    console.log("  Created " + created + " rooms");
  }

  // --- Summary ---
  var allHostels = await Hostel.find({ isActive: true });
  var totalRooms = await Room.countDocuments();
  console.log("\n=== DATABASE SUMMARY ===");
  for (var k = 0; k < allHostels.length; k++) {
    var h = allHostels[k];
    var rc = await Room.countDocuments({ hostel: h._id });
    console.log("  [" + h.type + "] " + h.name + " — " + h.location + " (" + rc + " rooms)");
  }
  console.log("Active hostels: " + allHostels.length);
  console.log("Total rooms: " + totalRooms);
  console.log("========================");
  console.log("Seed complete!");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(function(err) { console.error("SEED FAILED:", err.message); process.exit(1); });
