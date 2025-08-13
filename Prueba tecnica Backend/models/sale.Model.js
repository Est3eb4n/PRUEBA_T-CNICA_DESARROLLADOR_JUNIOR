export class Sale {
    constructor({ id, date, amount, total, seller_id, product_id }) {
        this.id = id;
        this.date = date;
        this.amount = amount;
        this.total = total;
        this.seller_id = seller_id;
        this.product_id = product_id;
    }
    
    static async create(db, { date, amount, total, seller_id, product_id }) {
        const { lastID } = await db.run(
            `INSERT INTO Sale (date, amount, total, seller_id, product_id) 
             VALUES (?, ?, ?, ?, ?)`,
            [date, amount, total, seller_id, product_id]
        );
        return new Sale({ id: lastID, date, amount, total, seller_id, product_id });
    }
    
    static async getAll(db) {
        return await db.all(`
            SELECT s.*, p.name as product_name, p.price as product_price,
                   sl.name as seller_name, sl.email as seller_email
            FROM Sale s
            JOIN Product p ON s.product_id = p.id
            JOIN Seller sl ON s.seller_id = sl.id
        `);
    }
    
    static async getById(db, id) {
        return await db.get(`
            SELECT s.*, p.name as product_name, p.price as product_price,
                   sl.name as seller_name, sl.email as seller_email
            FROM Sale s
            JOIN Product p ON s.product_id = p.id
            JOIN Seller sl ON s.seller_id = sl.id
            WHERE s.id = ?
        `, [id]);
    }
    
    static async delete(db, id) {
        return await db.run('DELETE FROM Sale WHERE id = ?', [id]);
    }
    
    static async getBySeller(db, seller_id) {
        return await db.all('SELECT * FROM Sale WHERE seller_id = ?', [seller_id]);
    }
    
    static async getByProduct(db, product_id) {
        return await db.all('SELECT * FROM Sale WHERE product_id = ?', [product_id]);
    }
}