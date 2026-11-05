import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PGlite } from "@electric-sql/pglite";
import bcryptjs from "bcryptjs";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "../data/postgres");
const documentsDir = path.resolve(__dirname, "../data/documents");

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(documentsDir, { recursive: true });

export const db = new PGlite(dataDir);

const TABLES = ["users", "vehicles", "bookings", "masterdatas"];

export async function initPostgres() {
  await db.waitReady;

  for (const table of TABLES) {
    await db.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL
      )
    `);
  }

  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users ((data->>'email'))`
  );
  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS users_username_idx ON users ((data->>'username'))`
  );
  await db.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS vehicles_reg_idx ON vehicles ((data->>'registeration_number'))`
  );

  await seedIfEmpty();
  await syncTamilNaduData();
}

async function countRows(table) {
  const result = await db.query(`SELECT COUNT(*)::int AS count FROM ${table}`);
  return result.rows[0].count;
}

async function insertDoc(table, doc) {
  const id = doc._id || randomUUID();
  const data = { ...doc, _id: id };
  await db.query(`INSERT INTO ${table} (id, data) VALUES ($1, $2::jsonb)`, [
    id,
    JSON.stringify(data),
  ]);
  return data;
}

const TN_SAMPLE_VEHICLES = [
  {
    registeration_number: "TN-01-AB-1001",
    company: "maruthi",
    name: "Alto 800",
    model: "Alto 800",
    car_title: "Alto 800",
    car_description: "Easy city hatchback for Chennai travel",
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    price: 1800,
    year_made: 2022,
    car_type: "hatchback",
    location: "Chennai Airport",
    district: "Chennai",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-02-CD-1002",
    company: "maruthi",
    name: "Swift",
    model: "MARUTI SWIFT Petrol AT",
    car_title: "Maruti Swift AT",
    car_description: "Smooth automatic hatchback for city drive",
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    price: 2200,
    year_made: 2023,
    car_type: "hatchback",
    location: "Chennai Central Railway Station",
    district: "Chennai",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-19-BC-2002",
    company: "skoda",
    name: "Slavia",
    model: "SKODA SLAVIA PETROL AT",
    car_title: "Skoda Slavia",
    car_description: "Comfort sedan with luxury interiors",
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    price: 3200,
    year_made: 2023,
    car_type: "sedan",
    location: "Mahindra World City",
    district: "Chengalpattu",
    image: [
      "https://img.freepik.com/premium-photo/luxury-car-rental-car-sale-social-media-instagram-post-template-design_1126722-2530.jpg",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-19-EF-2003",
    company: "volkswagen",
    name: "Taigun",
    model: "VW TAIGUN Petrol MT",
    car_title: "Volkswagen Taigun",
    car_description: "Robust German SUV for family journeys",
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    price: 3000,
    year_made: 2023,
    car_type: "suv",
    location: "Chengalpattu Railway Station",
    district: "Chengalpattu",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-21-CD-3003",
    company: "nissan",
    name: "Magnite",
    model: "NISSAN MAGNITE PETROL MT",
    car_title: "Nissan Magnite",
    car_description: "Compact SUV suited for industrial hubs and highway drives",
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    price: 2800,
    year_made: 2023,
    car_type: "suv",
    location: "Oragadam",
    district: "Kancheepuram",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-21-GH-3004",
    company: "skoda",
    name: "Kushaq",
    model: "SKODA KUSHAQ Petrol AT",
    car_title: "Skoda Kushaq AT",
    car_description: "Premium crossover SUV with advanced safety features",
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    price: 3400,
    year_made: 2023,
    car_type: "suv",
    location: "Kancheepuram Bus Stand",
    district: "Kancheepuram",
    image: [
      "https://img.freepik.com/premium-photo/luxury-car-rental-car-sale-social-media-instagram-post-template-design_1126722-2530.jpg",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-37-DE-4004",
    company: "mg",
    name: "Hector",
    model: "MG HECTOR Petrol AT",
    car_title: "MG Hector AT",
    car_description: "Smart connected SUV perfect for Coimbatore journeys",
    fuel_type: "petrol",
    seats: 5,
    transmition: "automatic",
    price: 3600,
    year_made: 2023,
    car_type: "suv",
    location: "Coimbatore Airport",
    district: "Coimbatore",
    image: [
      "https://img.freepik.com/premium-photo/luxury-car-rental-car-sale-social-media-instagram-post-template-design_1126722-2530.jpg",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-38-JK-4005",
    company: "hyundai",
    name: "Alcazar",
    model: "HYUNDAI ALCAZAR Diesel AT",
    car_title: "Hyundai Alcazar 7-Seater",
    car_description: "Spacious 7-seater diesel SUV for road trips",
    fuel_type: "diesel",
    seats: 7,
    transmition: "automatic",
    price: 4200,
    year_made: 2023,
    car_type: "suv",
    location: "Gandhipuram Bus Stand",
    district: "Coimbatore",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-45-EF-5005",
    company: "volkswagen",
    name: "Polo",
    model: "VW POLO Petrol MT",
    car_title: "Volkswagen Polo",
    car_description: "Dynamic driver's car for Tiruchirappalli city and highways",
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    price: 2400,
    year_made: 2022,
    car_type: "hatchback",
    location: "Tiruchirappalli Airport",
    district: "Tiruchirappalli",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
  {
    registeration_number: "TN-45-LM-5006",
    company: "maruthi",
    name: "Dzire",
    model: "MARUTI DZIRE Petrol MT",
    car_title: "Maruti Dzire",
    car_description: "Comfortable and fuel-efficient compact sedan",
    fuel_type: "petrol",
    seats: 5,
    transmition: "manual",
    price: 2500,
    year_made: 2023,
    car_type: "sedan",
    location: "Central Bus Stand",
    district: "Tiruchirappalli",
    image: [
      "https://evmwheels.com/front-theme/images/Group%20316.png",
    ],
    isDeleted: "false",
    isBooked: false,
    isAdminAdded: true,
    isAdminApproved: true,
    isRejected: false,
    addedBy: "admin",
  },
];

async function seedIfEmpty() {
  if ((await countRows("users")) === 0) {
    const password = bcryptjs.hashSync("admin123", 10);
    await insertDoc("users", {
      username: "admin",
      email: "admin@local.com",
      password,
      isAdmin: true,
      isUser: false,
      isVendor: false,
      refreshToken: "",
      profilePicture:
        "https://media.istockphoto.com/id/1316420668/vector/user-icon-human-person-symbol-social-profile-icon-avatar-login-sign-web-user-symbol.jpg?s=612x612&w=0&k=20&c=AhqW2ssX8EeI2IYFm6-ASQ7rfeBWfrFFV4E87SaFhJE=",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await insertDoc("users", {
      username: "demo_user",
      email: "user@local.com",
      password: bcryptjs.hashSync("user123", 10),
      isAdmin: false,
      isUser: true,
      isVendor: false,
      refreshToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await insertDoc("users", {
      username: "demo_vendor",
      email: "vendor@local.com",
      password: bcryptjs.hashSync("vendor123", 10),
      isAdmin: false,
      isUser: false,
      isVendor: true,
      refreshToken: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    console.log("Seeded local users: admin@local.com / admin123");
  }

  if ((await countRows("masterdatas")) === 0) {
    const { dummyData } = await import("./seedData.js");
    for (const item of dummyData) {
      await insertDoc("masterdatas", item);
    }
    console.log("Seeded local locations and car models");
  }

  if ((await countRows("vehicles")) === 0) {
    for (const car of TN_SAMPLE_VEHICLES) {
      await insertDoc("vehicles", car);
    }
    console.log("Seeded local vehicles with Tamil Nadu data");
  }
}

/**
 * Migration & Synchronization helper:
 * 1. Removes any obsolete Kerala locations from masterdatas.
 * 2. Ensures all required Tamil Nadu locations are present in masterdatas.
 * 3. Updates any vehicles having Kerala registration or locations to Tamil Nadu records.
 * 4. Ensures vehicles exist for all 5 Tamil Nadu districts.
 */
async function syncTamilNaduData() {
  try {
    // 1. Remove non-Tamil Nadu locations from masterdatas
    const allowedDistricts = ["Chennai", "Chengalpattu", "Kancheepuram", "Coimbatore", "Tiruchirappalli"];
    await db.query(`
      DELETE FROM masterdatas 
      WHERE data->>'type' = 'location' 
      AND data->>'district' NOT IN ('Chennai', 'Chengalpattu', 'Kancheepuram', 'Coimbatore', 'Tiruchirappalli')
    `);
    await db.query(`DELETE FROM masterdatas WHERE data->>'location' ILIKE '%kalamassery%' OR data->>'location' ILIKE '%cheranallur%' OR data->>'location' ILIKE '%ettumanoor%' OR data->>'location' ILIKE '%thrissur%' OR data->>'location' ILIKE '%valarkavu%' OR data->>'location' ILIKE '%paliyekara%'`);

    // 2. Ensure all Tamil Nadu locations and car models from seedData are present
    const { dummyData } = await import("./seedData.js");
    const existingMaster = await db.query(`SELECT data FROM masterdatas`);
    const existingIds = new Set(existingMaster.rows.map((r) => {
      const d = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
      return d.id || d._id;
    }));
    const existingLocations = new Set(existingMaster.rows.map((r) => {
      const d = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
      return d.type === "location" ? `${d.district}:::${d.location}` : "";
    }));

    for (const item of dummyData) {
      const key = item.type === "location" ? `${item.district}:::${item.location}` : "";
      if (!existingIds.has(item.id) && (!key || !existingLocations.has(key))) {
        await insertDoc("masterdatas", item);
      }
    }

    // 3. Update any vehicles with Kerala registrations or Kerala locations to Tamil Nadu
    const existingVehicles = await db.query(`SELECT id, data FROM vehicles`);
    for (const row of existingVehicles.rows) {
      const v = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
      const isKeralaReg = v.registeration_number && /^KL/i.test(v.registeration_number);
      const isKeralaDistrict = v.district && !allowedDistricts.includes(v.district);

      if (isKeralaReg || isKeralaDistrict) {
        // Map to corresponding Tamil Nadu vehicle
        let mapped = null;
        if (v.registeration_number?.includes("1001") || v.name === "Alto 800") {
          mapped = TN_SAMPLE_VEHICLES[0];
        } else if (v.registeration_number?.includes("2002") || v.name === "Slavia") {
          mapped = TN_SAMPLE_VEHICLES[2];
        } else if (v.registeration_number?.includes("3003") || v.name === "Magnite") {
          mapped = TN_SAMPLE_VEHICLES[4];
        } else {
          mapped = TN_SAMPLE_VEHICLES[0];
        }

        const updatedData = {
          ...v,
          registeration_number: mapped.registeration_number,
          district: mapped.district,
          location: mapped.location,
          car_description: mapped.car_description,
          company: mapped.company,
          model: mapped.model,
          car_title: mapped.car_title,
          updatedAt: new Date().toISOString(),
        };

        await db.query(`UPDATE vehicles SET data = $2::jsonb WHERE id = $1`, [
          row.id,
          JSON.stringify(updatedData),
        ]);
      }
    }

    // 4. Ensure sample vehicles exist for all 5 districts
    const currentVehicles = await db.query(`SELECT data FROM vehicles`);
    const currentRegs = new Set(currentVehicles.rows.map((r) => {
      const d = typeof r.data === "string" ? JSON.parse(r.data) : r.data;
      return d.registeration_number;
    }));

    for (const car of TN_SAMPLE_VEHICLES) {
      if (!currentRegs.has(car.registeration_number)) {
        await insertDoc("vehicles", car);
        currentRegs.add(car.registeration_number);
      }
    }

    console.log("Synchronized Tamil Nadu locations and vehicle fleet successfully.");
  } catch (error) {
    console.error("Error synchronizing Tamil Nadu data:", error);
  }
}
