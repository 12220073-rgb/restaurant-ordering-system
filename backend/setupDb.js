const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const tables = [
    `DROP TABLE IF EXISTS order_items`,
    `DROP TABLE IF EXISTS orders`,
    `DROP TABLE IF EXISTS feedback`,
    `DROP TABLE IF EXISTS menu_items`,
    `DROP TABLE IF EXISTS categories`,
    `DROP TABLE IF EXISTS users`,
    `CREATE TABLE categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category_id INT,
      description TEXT,
      image VARCHAR(255),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,
    `CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL
    )`,
    `CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255),
      customer_phone VARCHAR(20),
      customer_address TEXT,
      total DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      item_id INT,
      item_name VARCHAR(255),
      quantity INT,
      subtotal DECIMAL(10,2),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )`,
    `CREATE TABLE feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      comment TEXT,
      date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ];

  for (const sql of tables) {
    await conn.execute(sql);
    console.log('Table created or exists');
  }

  // Insert sample data
  await conn.execute('INSERT IGNORE INTO categories (name) VALUES ("Appetizers"), ("Main Courses"), ("Desserts"), ("Beverages")');
  await conn.execute('INSERT IGNORE INTO menu_items (name, price, category_id, description) VALUES ("Burger", 10.99, 2, "Delicious burger"), ("Pizza", 12.99, 2, "Cheesy pizza"), ("Salad", 7.99, 1, "Fresh salad")');

  console.log('DB setup complete');
  conn.end();
})();