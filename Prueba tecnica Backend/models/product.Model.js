export class Product {
    constructor({ id, name, price, stock }) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
    }
    
    static async create(db, { name, price, stock }) {
        const { lastID } = await db.run(
            'INSERT INTO Product (name, price, stock) VALUES (?, ?, ?)',
            [name, price, stock]
        );
        return new Product({ id: lastID, name, price, stock });
    }
    
    static async getAll(db) {
        return await db.all('SELECT * FROM Product');
    }
    
    static async getById(db, id) {
        return await db.get('SELECT * FROM Product WHERE id = ?', [id]);
    }
    
    static async update(db, id, { name, price, stock }) {
        await db.run(
            'UPDATE Product SET name = ?, price = ?, stock = ? WHERE id = ?',
            [name, price, stock, id]
        );
        return new Product({ id, name, price, stock });
    }
    
    static async delete(db, id) {
        return await db.run('DELETE FROM Product WHERE id = ?', [id]);
    }
    
    static async reduceStock(db, id, quantity) {
        await db.run(
            'UPDATE Product SET stock = stock - ? WHERE id = ? AND stock >= ?',
            [quantity, id, quantity]
        );
        return await this.getById(db, id);
    }
}