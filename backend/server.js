
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', // Default no password for local dev often
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const dbName = process.env.DB_NAME || 'dahanu_db';

let pool;

// Initialize Database
const initDb = async () => {
  try {
    // 1. Create Connection to create DB if not exists
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    console.log(`Database ${dbName} checked/created.`);

    // 2. Initialize Pool with Database
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName
    });

    console.log('Connected to MySQL Database.');

    // 3. Create Tables
    // Categories
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        description TEXT,
        parent_id VARCHAR(50),
        theme_color VARCHAR(20) DEFAULT '#9C81A4',
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      )
    `);

    // Vendors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendors (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        rating DECIMAL(3,1),
        lat DECIMAL(10,8),
        lng DECIMAL(11,8),
        address TEXT,
        contact VARCHAR(50),
        masked_contact VARCHAR(50),
        is_verified BOOLEAN DEFAULT FALSE,
        is_approved BOOLEAN DEFAULT FALSE,
        image_url TEXT,
        price_start DECIMAL(10,2),
        email VARCHAR(100)
      )
    `);

    // Vendor Categories (Junction Table)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_categories (
        vendor_id VARCHAR(50),
        category_id VARCHAR(50),
        PRIMARY KEY (vendor_id, category_id),
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
      )
    `);

    // Products
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        vendor_id VARCHAR(50),
        name VARCHAR(100),
        price DECIMAL(10,2),
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
      )
    `);

    // Banners
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR(50) PRIMARY KEY,
        image_url TEXT,
        link TEXT,
        alt_text VARCHAR(255)
      )
    `);

    // Orders
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        vendor_id VARCHAR(50),
        customer_name VARCHAR(100),
        customer_phone VARCHAR(20),
        service_requested VARCHAR(100),
        date VARCHAR(50),
        status VARCHAR(20),
        address TEXT,
        amount DECIMAL(10,2),
        FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
      )
    `);

    console.log("Tables initialized.");

    // 4. Seed Data
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM categories");
    if (rows[0].count === 0) {
      console.log("Seeding Database...");
      await seedData();
    }

  } catch (err) {
    console.error("Database Initialization Error:", err);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Categories with Theme Colors
    const categories = [
      ['events', 'Events Services', 'PartyPopper', 'Everything you need for your special occasions.', '#9C27B0', null],
      ['medical', 'Medical & Health', 'Stethoscope', 'Healthcare services, clinics, and emergency support.', '#2196F3', null],
      ['transport', 'Transport', 'Truck', 'Logistics, travel agencies, and vehicle rentals.', '#FF9800', null],
      ['beauty', 'Beauty & Wellness', 'Sparkles', 'Salons, spas, and fitness centers.', '#E91E63', null],
      ['home', 'Home & Maintenance', 'Hammer', 'Repairs, renovations, and handyman services.', '#4CAF50', null],
      ['housekeeping', 'Housekeeping', 'SprayCan', 'Maids, cooks, and daily utility supplies.', '#009688', null],
      ['food', 'Food & Beverages', 'Utensils', 'Restaurants, cafes, and street food.', '#F44336', null],
      ['accom', 'Accommodation', 'Hotel', 'Hotels, lodges, and guest houses.', '#FFC107', null]
    ];

    for (const c of categories) {
      await pool.query(
        "INSERT IGNORE INTO categories (id, name, icon, description, theme_color, parent_id) VALUES (?,?,?,?,?,?)",
        c
      );
    }
    
    // Sub-Categories
    const subCategories = [
      ['event_planning', 'Event Planning', null, null, null, 'events'],
      ['catering', 'Catering & Food', null, null, null, 'events'],
      ['plumber', 'Plumber', null, null, null, 'home']
    ];
    for (const s of subCategories) {
       await pool.query(
        "INSERT IGNORE INTO categories (id, name, icon, description, theme_color, parent_id) VALUES (?,?,?,?,?,?)",
        s
      );
    }

    // Vendors (Added is_approved)
    const vendors = [
      ['v1', 'Elite Event Planners', 'Premier event planning', 4.8, 19.9700, 72.7300, '123 Main St, Dahanu', '+919876543210', '+91 98*** **210', true, true, 'https://picsum.photos/300/200?random=10', 5000, 'elite@events.com'],
      ['v3', 'Quick Fix Plumbers', 'Expert plumbing', 4.2, 19.9650, 72.7250, '88 Pipe Lane, Dahanu', '+919876543212', '+91 98*** **212', true, true, 'https://picsum.photos/300/200?random=12', 150, 'fix@plumbers.com']
    ];

    for (const v of vendors) {
      await pool.query(
        `INSERT IGNORE INTO vendors 
        (id, name, description, rating, lat, lng, address, contact, masked_contact, is_verified, is_approved, image_url, price_start, email) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        v
      );
    }

    // Vendor Categories
    const vc = [
      ['v1', 'event_planning'],
      ['v3', 'plumber']
    ];
    for (const item of vc) {
      await pool.query("INSERT IGNORE INTO vendor_categories (vendor_id, category_id) VALUES (?,?)", item);
    }

    // Products
    const products = [
      ['v1', 'Wedding Package', 50000],
      ['v1', 'Birthday Basic', 15000],
      ['v3', 'Tap Repair', 150]
    ];
    for (const p of products) {
      await pool.query("INSERT INTO products (vendor_id, name, price) VALUES (?,?,?)", p);
    }

    // Banners
    const banners = [
      ['1', 'https://picsum.photos/1200/300?random=1', '#', 'Big Sale on Home Services'],
      ['2', 'https://picsum.photos/1200/300?random=2', '#', 'Wedding Season Discounts']
    ];
    for (const b of banners) {
      await pool.query("INSERT IGNORE INTO banners (id, image_url, link, alt_text) VALUES (?,?,?,?)", b);
    }

    console.log("Database Seeded Successfully.");
  } catch (err) {
    console.error("Seeding Error:", err);
  }
};

initDb();

// --- API ROUTES ---

// 1. Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    
    // Recursive function to build tree
    const buildTree = (parentId) => {
      return rows
        .filter(cat => cat.parent_id === parentId)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          themeColor: cat.theme_color,
          subCategories: buildTree(cat.id)
        }));
    };

    res.json(buildTree(null));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Vendors
app.get('/api/vendors', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `
      SELECT v.*, GROUP_CONCAT(vc.category_id) as categoryIds 
      FROM vendors v 
      LEFT JOIN vendor_categories vc ON v.id = vc.vendor_id
    `;
    
    let conditions = [];
    let params = [];

    // Filter only approved vendors for public API
    conditions.push("v.is_approved = TRUE");

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

    const [vendors] = await pool.query(sql, params);

    // Fetch products and format data
    for (let v of vendors) {
      const [products] = await pool.query("SELECT name, price FROM products WHERE vendor_id = ?", [v.id]);
      v.products = products;
      v.categoryIds = v.categoryIds ? v.categoryIds.split(',') : [];
      v.location = { lat: parseFloat(v.lat), lng: parseFloat(v.lng), address: v.address };
      v.maskedContact = v.masked_contact;
      v.isVerified = Boolean(v.is_verified);
      v.isApproved = Boolean(v.is_approved);
      v.imageUrl = v.image_url;
      v.priceStart = parseFloat(v.price_start);
      
      // Remove DB specific snake_case keys
      delete v.masked_contact;
      delete v.is_verified;
      delete v.is_approved;
      delete v.image_url;
      delete v.price_start;
      delete v.lat;
      delete v.lng;
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
    const [rows] = await pool.query("SELECT id, image_url as imageUrl, link, alt_text as altText FROM banners");
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
    
    await pool.query(
      `INSERT INTO orders (id, vendor_id, customer_name, customer_phone, service_requested, date, status, address, amount)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [id, vendorId, customerName, customerPhone, serviceRequested, date, address, amount]
    );

    res.json({ success: true, orderId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
