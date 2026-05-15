require('dotenv').config();
const sequelize = require('./src/config/database');
const Product = require('./src/models/Product');
const User = require('./src/models/User');

const runSeeder = async () => {
    try {
    console.log('⏳ Connecting to database...');
    await sequelize.authenticate();
    
    const seller = await User.findOne({ where: { email: '23bcs011@iiitdmj.ac.in' } });
    if (!seller) {
      console.log('❌ User not found!');
      process.exit(1);
    }
    const sellerId = seller.id;

    console.log(`🗑️ Clearing old products...`);
    await Product.destroy({ where: {} }); // This wipes the table clean!

    console.log(`👤 Using User ${seller.firstName} as the Seller. Injecting products...`);

    const dummyProducts = [
      {
        sellerId,
        sku: 'TECH-APL-MBP-14',
        name: 'MacBook Pro 14"',
        desc: 'M3 Pro chip, 18GB RAM, 512GB SSD. The ultimate developer machine.',
        price: 1999.00,
        pStock: 15,
        status: 'ACTIVE',
        isPre: false,
        isFinalSale: false,
        category: 'Electronics',
        imgs: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
        facets: { brand: 'Apple', color: 'Space Black', ram: '18GB', storage: '512GB' }
      },
      {
        sellerId,
        sku: 'CLO-NKE-AF1-WHT',
        name: 'Nike Air Force 1 \'07',
        desc: 'The radiance lives on in the Nike Air Force 1 ’07, the b-ball icon that puts a fresh spin on what you know best.',
        price: 115.00,
        pStock: 45,
        status: 'ACTIVE',
        isPre: false,
        isFinalSale: false,
        category: 'Apparel',
        imgs: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80'],
        facets: { brand: 'Nike', color: 'White', size: 'US 10', material: 'Leather' }
      },
      {
        sellerId,
        sku: 'HOM-SMEG-COF-BL',
        name: 'Smeg Espresso Machine',
        desc: '50s Retro Style Aesthetic Espresso Coffee Machine. Brews perfectly every time.',
        price: 529.95,
        pStock: 0,
        status: 'OUT_OF_STOCK',
        isPre: false,
        isFinalSale: true,
        category: 'Home & Kitchen',
        imgs: ['https://images.unsplash.com/photo-1620807773206-49c1f2957417?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'],
        facets: { brand: 'Smeg', color: 'Pastel Blue', style: 'Retro' }
      },
      {
        sellerId,
        sku: 'GAM-SONY-PS5-PRO',
        name: 'PlayStation 5 Pro Console',
        desc: 'The next generation of gaming is almost here. Reserve your unit today.',
        price: 599.99,
        pStock: 0,
        status: 'ACTIVE',
        isPre: true,
        isFinalSale: false,
        category: 'Gaming',
        imgs: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80'],
        facets: { brand: 'Sony', edition: 'Digital', resolution: '8K' }
      },
      {
        sellerId,
        sku: 'ACC-ROLEX-SUB-01',
        name: 'Rolex Submariner Date',
        desc: 'Oyster, 41 mm, Oystersteel and yellow gold. The reference among divers\' watches.',
        price: 15500.00,
        pStock: 2,
        status: 'ACTIVE',
        isPre: false,
        isFinalSale: true,
        category: 'Accessories',
        imgs: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80'],
        facets: { brand: 'Rolex', color: 'Gold/Black', material: 'Oystersteel' }
      }
    ];

    await Product.bulkCreate(dummyProducts);
    console.log('✅ Successfully seeded 5 diverse products with working images!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
};

runSeeder();