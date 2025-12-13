
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
    
    // USERS Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        phone VARCHAR(20),
        role ENUM('USER', 'VENDOR', 'ADMIN') DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
        user_id VARCHAR(50),
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
        promotional_banner_url TEXT,
        supports_delivery BOOLEAN DEFAULT FALSE,
        price_start DECIMAL(10,2),
        email VARCHAR(100),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
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
        image_url TEXT,
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
    
    // Seed Admin if not exists
    const [adminRows] = await pool.query("SELECT * FROM users WHERE role = 'ADMIN'");
    if (adminRows.length === 0) {
       console.log("Creating default Admin user...");
       await pool.query(
         "INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)",
         ['u_admin', 'System Admin', 'admin@dahanu.com', 'admin123', '9876543210', 'ADMIN']
       );
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
      ['dahanu_fresh', 'Dahanu Fresh', 'Apple', 'Fresh fruits, vegetables and organic produce.', '#43A047', null],
      ['dahanu_mart', 'Dahanu Mart', 'ShoppingBasket', 'Groceries, daily essentials, and supermarket.', '#FF5722', null],
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
      ['fruits', 'Fresh Fruits', null, null, null, 'dahanu_fresh'],
      ['vegetables', 'Vegetables', null, null, null, 'dahanu_fresh'],
      ['daily_needs', 'Daily Essentials', null, null, null, 'dahanu_mart'],
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

    // Vendors
    const vendors = [
      ['v1', 'Elite Event Planners', 'Premier event planning', 4.8, 19.9700, 72.7300, '123 Main St, Dahanu', '+919876543210', '+91 98*** **210', true, true, 'https://picsum.photos/300/200?random=10', null, false, 5000, 'elite@events.com'],
      ['v3', 'Quick Fix Plumbers', 'Expert plumbing', 4.2, 19.9650, 72.7250, '88 Pipe Lane, Dahanu', '+919876543212', '+91 98*** **212', true, true, 'https://picsum.photos/300/200?random=12', null, false, 150, 'fix@plumbers.com'],
      ['v4', 'Green Farm Fresh', 'Fresh organic vegetables', 4.9, 19.9700, 72.7300, 'Farm No 4, Bordi Road', '+919999988888', '+91 99999 88888', true, true, 'https://picsum.photos/300/200?random=13', 'https://picsum.photos/1200/300?random=88', true, 20, 'fresh@greenfarm.com']
    ];

    for (const v of vendors) {
      await pool.query(
        `INSERT IGNORE INTO vendors 
        (id, name, description, rating, lat, lng, address, contact, masked_contact, is_verified, is_approved, image_url, promotional_banner_url, supports_delivery, price_start, email) 
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        v
      );
    }

    // Vendor Categories
    const vc = [
      ['v1', 'event_planning'],
      ['v3', 'plumber'],
      ['v4', 'dahanu_fresh']
    ];
    for (const item of vc) {
      await pool.query("INSERT IGNORE INTO vendor_categories (vendor_id, category_id) VALUES (?,?)", item);
    }

    // Products
    const products = [
      ['v1', 'Wedding Package', 50000, null],
      ['v1', 'Birthday Basic', 15000, null],
      ['v3', 'Tap Repair', 150, null],
      ['v4', 'Red Apples (1kg)', 180, 'https://picsum.photos/200?random=101'],
      ['v4', 'Fresh Spinach', 20, 'https://picsum.photos/200?random=102']
    ];
    for (const p of products) {
      await pool.query("INSERT INTO products (vendor_id, name, price, image_url) VALUES (?,?,?,?)", p);
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

// ========================
// AUTHENTICATION & OTP
// ========================

// In-memory OTP Store (NOTE: Use Redis or DB in production)
const otpStore = new Map();

// Request OTP
app.post('/api/auth/otp/request', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number required" });
  
  // Generate 4 digit OTP (Mocked)
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
  
  console.log(`[AUTH] OTP generated for ${phone}: ${otp}`);
  otpStore.set(phone, { otp, expires: Date.now() + 300000 }); // 5 mins expiration

  // TODO: Integrate SMS Gateway here (e.g. Twilio, Msg91)
  res.json({ success: true, message: 'OTP sent successfully' });
});

// Verify OTP
app.post('/api/auth/otp/verify', async (req, res) => {
  const { phone, otp } = req.body;
  
  // Backdoor for demo/admin testing
  if (phone === '9876543210' && otp === '1234') {
     // Proceed to check user
  } else {
      const record = otpStore.get(phone);
      if (!record) return res.status(400).json({ error: "OTP not requested or expired" });
      if (record.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
      if (Date.now() > record.expires) {
          otpStore.delete(phone);
          return res.status(400).json({ error: "OTP Expired" });
      }
      otpStore.delete(phone); // Burn OTP after use
  }

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
    
    if (users.length > 0) {
       const user = users[0];
       delete user.password;
       res.json({ success: true, isNewUser: false, user });
    } else {
       res.json({ success: true, isNewUser: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Register User (Complete profile after OTP or direct)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { id, name, email, phone, role, password } = req.body;
    
    if (!id || !name || !email || !phone) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Check duplicates
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR phone = ?', [email, phone]);
    if (existing.length > 0) return res.status(409).json({ error: "User already exists with this email or phone" });

    // Insert
    await pool.query(
        'INSERT INTO users (id, name, email, phone, role, password) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, email, phone, role || 'USER', password || null]
    );

    // Fetch created user
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = users[0];
    delete user.password;

    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Login (Password based - e.g. for Admin or specific users)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    
    const user = users[0];
    // NOTE: In production, compare hashed password (e.g., bcrypt.compare)
    if (user.password !== password) return res.status(401).json({ error: "Invalid credentials" }); 
    
    delete user.password;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================
// USER MANAGEMENT
// ========================

// Get All Users (Admin)
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Single User
app.get('/api/users/:id', async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });
        res.json(users[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update User
app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        // Basic validation
        if (!name && !email && !phone) return res.status(400).json({error: "Nothing to update"});

        // Construct dynamic query
        let fields = [];
        let params = [];
        if (name) { fields.push('name = ?'); params.push(name); }
        if (email) { fields.push('email = ?'); params.push(email); }
        if (phone) { fields.push('phone = ?'); params.push(phone); }
        
        params.push(req.params.id);

        await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
        res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========================
// EXISTING APP ROUTES
// ========================

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
      const [products] = await pool.query("SELECT name, price, image_url FROM products WHERE vendor_id = ?", [v.id]);
      
      // Map product image_url to image
      v.products = products.map(p => ({
        name: p.name,
        price: parseFloat(p.price),
        image: p.image_url
      }));

      v.categoryIds = v.categoryIds ? v.categoryIds.split(',') : [];
      v.location = { lat: parseFloat(v.lat), lng: parseFloat(v.lng), address: v.address };
      v.maskedContact = v.masked_contact;
      v.isVerified = Boolean(v.is_verified);
      v.isApproved = Boolean(v.is_approved);
      v.imageUrl = v.image_url;
      v.promotionalBannerUrl = v.promotional_banner_url;
      v.supportsDelivery = Boolean(v.supports_delivery);
      v.priceStart = parseFloat(v.price_start);
      
      // Remove DB specific snake_case keys
      delete v.masked_contact;
      delete v.is_verified;
      delete v.is_approved;
      delete v.image_url;
      delete v.promotional_banner_url;
      delete v.supports_delivery;
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
