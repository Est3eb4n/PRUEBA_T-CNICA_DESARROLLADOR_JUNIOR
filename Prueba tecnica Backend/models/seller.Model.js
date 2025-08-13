export class Seller {
    constructor({id, name, email}) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    
    static async create(db, { name, email }) {
        try {
            const { lastID } = await db.run(
                'INSERT INTO Seller (name, email) VALUES(?, ?)',
                [name, email]
            );
            return new Seller({ id: lastID, name, email });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('El email ya está registrado');
            }
            throw error;
        }
    }

    static async getAll(db) {
        return await db.all('SELECT * FROM Seller');
    }

    static async getById(db, id) {
        return await db.get('SELECT * FROM Seller WHERE id = ?', [id]);
    }

    static async update(db, id, { name, email }) {
        await db.run(
            'UPDATE Seller SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        );
        return new Seller({ id, name, email });
    }

    static async delete(db, id) {
        return await db.run('DELETE FROM Seller WHERE id = ?', [id]);
    }
}