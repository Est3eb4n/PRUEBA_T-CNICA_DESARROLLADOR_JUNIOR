export async function populateInitialData() {
    const db = await connectDB();

    // Limpiar tablas
    await db.run('DELETE FROM Sale');
    await db.run('DELETE FROM Seller');
    await db.run('DELETE FROM Product');

    // Insertar vendedores
    const seller1 = await Seller.create(db, {
        name: 'Juan Perez',
        email: 'juan@example.com'
    });
    
    const seller2 = await Seller.create(db, {
        name: 'Maria Lopez',
        email: 'maria@example.com'
    });
    
    // Insertar productos
    const product1 = await Product.create(db, {
        name: 'Laptop',
        price: 1200.50,
        stock: 10
    });
    
    const product2 = await Product.create(db, {
        name: 'Mouse',
        price: 25.99,
        stock: 50
    });
    
    // Insertar ventas
    await Sale.create(db, {
        date: '2023-01-15',
        amount: 1,
        total: 1200.50,
        seller_id: seller1.id,
        product_id: product1.id
    });
    
    await Sale.create(db, {
        date: '2023-01-16',
        amount: 2,
        total: 51.98,
        seller_id: seller2.id,
        product_id: product2.id
    });
}