const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(__dirname, 'dahanu.db');

// Middleware
app.use(cors());
app.use(express.json());

// --- DATABASE SETUP (SQLite) ---
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database ' + DB_PATH, err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

// Helper to run queries with promises
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Initialize Database (Create Tables & Seed Data)
const initDb = async () => {
  try {
    // 1. Categories
    await dbRun(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      description TEXT,
      parent_id TEXT,
      FOREIGN KEY(parent_id) REFERENCES categories(id)
    )`);

    // 2. Vendors
    await dbRun(`CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rating DECIMAL(2,1),
      lat DECIMAL(10,8),
      lng DECIMAL(11,8),
      address TEXT,
      contact TEXT,
      masked_contact TEXT,
      is_verified BOOLEAN,
      image_url TEXT,
      price_start DECIMAL(10,2),
      email TEXT
    )`);

    // 3. Vendor Categories (Many-to-Many)
    await dbRun(`CREATE TABLE IF NOT EXISTS vendor_categories (
      vendor_id TEXT,
      category_id TEXT,
      PRIMARY KEY (vendor_id, category_id),
      FOREIGN KEY(vendor_id) REFERENCES vendors(id),
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )`);

    // 4. Products
    await dbRun(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vendor_id TEXT,
      name TEXT,
      price DECIMAL(10,2),
      FOREIGN KEY(vendor_id) REFERENCES vendors(id)
    )`);

    // 5. Banners
    await dbRun(`CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      image_url TEXT,
      link TEXT,
      alt_text TEXT
    )`);

    // 6. Orders
    await dbRun(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      vendor_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      service_requested TEXT,
      date TEXT,
      status TEXT,
      address TEXT,
      amount DECIMAL(10,2),
      FOREIGN KEY(vendor_id) REFERENCES vendors(id)
    )`);

    // --- SEED DATA (Only if categories are empty) ---
    const rows = await dbAll("SELECT count(*) as count FROM categories");
    if (rows[0].count === 0) {
      console.log("Seeding Database...");
      await seedData();
    }

  } catch (err) {
    console.error("Database Initialization Error:", err);
  }
};

const seedData = async () => {
  // Categories
  const cats = [
    ['events', 'Events Services', 'PartyPopper', 'Everything for occasions', null],
      ['event_planning', 'Event Planning', null, 'Corporate and private', 'events'],
        ['decorators', 'Decorators', null, null, 'event_planning'],
        ['event_mgmt', 'Event Management', null, null, 'event_planning'],
    ['medical', 'Medical & Health', 'Stethoscope', 'Healthcare services', null],
      ['hospitals', 'Hospitals & Clinics', null, 'General hospitals', 'medical'],
    ['home', 'Home & Maintenance', 'Hammer', 'Repairs and renovations', null],
      ['handyman', 'Handyman', null, 'Plumbers etc', 'home'],
        ['plumber', 'Plumber', null, null, 'handyman']
  ];
  
  for (const c of cats) {
    await dbRun("INSERT INTO categories (id, name, icon, description, parent_id) VALUES (?,?,?,?,?)", c);
  }

  // Vendors
  await dbRun(`INSERT INTO vendors (id, name, description, rating, lat, lng, address, contact, masked_contact, is_verified, image_url, price_start, email) VALUES 
  ('v1', 'Elite Event Planners', 'Premier event planning', 4.8, 40.7128, -74.0060, '123 Main St', '+19998887777', '+1 (555) 000-0001', 1, 'https://picsum.photos/300/200?random=10', 500, 'elite@events.com'),
  ('v3', 'Quick Fix Plumbers', 'Expert plumbing', 4.2, 40.7100, -74.0030, '88 Pipe Lane', '+19998887779', '+1 (555) 000-0003', 1, 'https://picsum.photos/300/200?random=12', 50, 'fix@plumbers.com')`);

  // Vendor Categories
  await dbRun("INSERT INTO vendor_categories (vendor_id, category_id) VALUES ('v1', 'event_mgmt'), ('v1', 'decorators'), ('v3', 'plumber')");

  // Products
  await dbRun("INSERT INTO products (vendor_id, name, price) VALUES ('v1', 'Wedding Package', 50000), ('v1', 'Birthday Basic', 15000), ('v3', 'Tap Repair', 150)");

  // Banners
  await dbRun(`INSERT INTO banners (id, image_url, link, alt_text) VALUES 
  ('1', 'https://picsum.photos/1200/300?random=1', '#', 'Big Sale on Home Services'),
  ('2', 'https://picsum.photos/1200/300?random=2', '#', 'Wedding Season Discounts')`);

  console.log("Database Seeded Successfully.");
};


// --- API ROUTES ---

// 1. Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM categories');
    
    // Convert flat list to tree
    const buildTree = (parentId) => {
      return rows
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          subCategories: buildTree(cat.id)
        }));
    };

    res.json(buildTree(null));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT v.*, GROUP_CONCAT(vc.category_id) as categoryIds 
               FROM vendors v 
               LEFT JOIN vendor_categories vc ON v.id = vc.vendor_id`;
    
    let conditions = [];
    let params = [];

    if (category) {
      conditions.push("vc.category_id = ?");
      params.push(category);
    }
    if (search) {
      conditions.push("(v.name LIKE ? OR v.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " GROUP BY v.id";

    const vendors = await dbAll(sql, params);

    // Fetch products for these vendors
    for (let v of vendors) {
      const products = await dbAll("SELECT name, price FROM products WHERE vendor_id = ?", [v.id]);
      v.products = products;
      v.categoryIds = v.categoryIds ? v.categoryIds.split(',') : [];
      v.location = { lat: v.lat, lng: v.lng, address: v.address };
      v.maskedContact = v.masked_contact;
      v.isVerified = !!v.is_verified;
      v.imageUrl = v.image_url;
      v.priceStart = v.price_start;
      
      // Cleanup raw snake_case keys if needed, but frontend maps them usually. 
      // To match existing frontend expected format:
    }

    res.json(vendors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Banners
app.get('/api/banners', async (req, res) => {
  try {
    const rows = await dbAll("SELECT id, image_url as imageUrl, link, alt_text as altText FROM banners");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { vendorId, customerName, customerPhone, serviceRequested, date, address, amount } = req.body;
    const id = 'o' + Date.now();
    
    await dbRun(
      `INSERT INTO orders (id, vendor_id, customer_name, customer_phone, service_requested, date, status, address, amount)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [id, vendorId, customerName, customerPhone, serviceRequested, date, address, amount]
    );

    res.json({ success: true, orderId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
