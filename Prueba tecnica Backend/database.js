import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_DIR = join(__dirname, 'data');
const DB_PATH = join(DB_DIR, 'sales-system.db');

export async function initializeDatabase() {
  try {
    // Crear directorio si no existe
    if (!existsSync(DB_DIR)) {
      mkdirSync(DB_DIR, { recursive: true });
      console.log(`📂 Directorio de base de datos creado: ${DB_DIR}`);
    }

    // Abrir conexión a la base de datos
    const db = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Habilitar claves foráneas
    await db.exec('PRAGMA foreign_keys = ON;');

    // Script de inicialización
    const INIT_SCRIPT = `
      -- Tabla de Vendedores
      CREATE TABLE IF NOT EXISTS Seller (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 2),
        email TEXT UNIQUE CHECK(email LIKE '%@%.%'),
        phone TEXT CHECK(length(phone) >= 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tabla de Productos
      CREATE TABLE IF NOT EXISTS Product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) >= 2),
        price REAL NOT NULL CHECK(price > 0),
        description TEXT,
        stock INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Tabla de Ventas
      CREATE TABLE IF NOT EXISTS Sale (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seller_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity > 0),
        total_price REAL NOT NULL CHECK(total_price > 0),
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES Seller(id) ON DELETE RESTRICT,
        FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE RESTRICT
      );
      
      -- Triggers para actualización de timestamps
      CREATE TRIGGER IF NOT EXISTS update_seller_timestamp
      AFTER UPDATE ON Seller
      BEGIN
        UPDATE Seller SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
      
      CREATE TRIGGER IF NOT EXISTS update_product_timestamp
      AFTER UPDATE ON Product
      BEGIN
        UPDATE Product SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
      END;
      
      -- Índices para mejorar rendimiento
      CREATE INDEX IF NOT EXISTS idx_seller_email ON Seller(email);
      CREATE INDEX IF NOT EXISTS idx_sale_date ON Sale(sale_date);
      CREATE INDEX IF NOT EXISTS idx_sale_seller ON Sale(seller_id);
      CREATE INDEX IF NOT EXISTS idx_sale_product ON Sale(product_id);
    `;

    await db.exec(INIT_SCRIPT);
    console.log(`📦 Base de datos inicializada en: ${DB_PATH}`);

    return db;
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}