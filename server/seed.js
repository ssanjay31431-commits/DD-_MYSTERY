const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Product = require('./models/Product');
const Theme = require('./models/Theme');
const Inventory = require('./models/Inventory');
const Coupon = require('./models/Coupon');
const AdminSettings = require('./models/AdminSettings');

const seedData = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dd_mystery_box');
    console.log(`[Seed Script] Connected to MongoDB: ${conn.connection.host}`);

    // Clear existing collections
    await User.deleteMany();
    await Product.deleteMany();
    await Theme.deleteMany();
    await Inventory.deleteMany();
    await Coupon.deleteMany();
    await AdminSettings.deleteMany();

    console.log('[Seed Script] Existing records cleared.');

    // 1. Create Default AdminSettings
    const settings = await AdminSettings.create({
      codAdvanceType: 'percentage',
      codAdvanceValue: 20, // 20% advance required online
      deliveryCharge: 0,
      freeDeliveryMinAmount: 199
    });
    console.log(`[Seed Script] AdminSettings initialized: 20% COD Advance Required`);

    // 2. Create Default Users
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'DD Mystery Admin',
      email: (process.env.ADMIN_EMAIL || 'ddmarket130@gmail.com').toLowerCase(),
      phone: '+91 79042 79655',
      password: process.env.ADMIN_PASSWORD || 'ddmarket468',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      authProviders: [{ provider: 'email', providerId: 'ddmarket130@gmail.com' }]
    });

    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'customer@example.com',
      phone: '+91 9123456789',
      password: 'Customer@123',
      role: 'customer',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      authProviders: [{ provider: 'email', providerId: 'customer@example.com' }]
    });

    console.log(`[Seed Script] Admin User Created: ${adminUser.email}`);
    console.log(`[Seed Script] Customer User Created: ${customerUser.email}`);

    // 3. Create Products with Rich Box Items (Images for every single item)
    const products = await Product.insertMany([
      {
        name: 'DD MYSTERY BOX – 90s KIDS EDITION',
        slug: 'dd-mystery-box-90s-kids-edition',
        price: 499,
        originalPrice: 799,
        tag: '90s NOSTALGIA',
        tagline: 'Relive Childhood Memories & Pure Nostalgia!',
        description: 'A grand childhood nostalgia mystery box packed with authentic 90s candies, retro games, toys, memory keepsakes and lucky rewards!',
        fullDescription: 'Experience the magic of 90s childhood! Every box contains 16 carefully curated nostalgic collectibles including classic candies, retro toys, and a chance to win ₹5,000 in our scratch reward card.',
        contents: [
          { name: 'Poppins', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80', description: 'Classic colorful candy roll', quantity: 1, category: 'Candy' },
          { name: 'Mango Bite', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=300&q=80', description: 'Authentic mango candy', quantity: 2, category: 'Candy' },
          { name: 'Melody', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=300&q=80', description: 'Melody yeh itni chocolaty kyun hai?', quantity: 2, category: 'Candy' },
          { name: 'Coffee Bite', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80', description: 'Classic coffee candy', quantity: 2, category: 'Candy' },
          { name: 'Boomer Bubble Gum', image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&w=300&q=80', description: 'Boomer Boom Boom Bubble Gum', quantity: 1, category: 'Gum' },
          { name: 'Phantom Sweet Cigarette', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=300&q=80', description: 'Retro sweet sugar stick candy', quantity: 1, category: 'Candy' },
          { name: 'Choki Choki', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=300&q=80', description: 'Liquid chocolate paste tube', quantity: 1, category: 'Chocolate' },
          { name: 'ABCD Biscuit', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=300&q=80', description: 'Alphabet retro biscuits', quantity: 1, category: 'Snack' },
          { name: 'Kamarkattu', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=300&q=80', description: 'Traditional jaggery coconut candy', quantity: 1, category: 'Candy' },
          { name: 'Kuchi Mittai', image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=300&q=80', description: 'Retro stick lollipop', quantity: 1, category: 'Candy' },
          { name: 'Water Ring Game', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=300&q=80', description: 'Classic handheld water ring toss toy', quantity: 1, category: 'Toy' },
          { name: 'Spinning Top / Bambaram', image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=300&q=80', description: 'Wooden spinning top toy with string', quantity: 1, category: 'Toy' },
          { name: 'Glass Marbles', image: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&w=300&q=80', description: 'Pack of 10 colorful glass marbles', quantity: 1, category: 'Toy' },
          { name: '2 Mystery Nostalgia Gifts', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48?auto=format&fit=crop&w=300&q=80', description: 'Handpicked retro mystery keepsakes', quantity: 2, isMystery: true, category: 'Mystery' },
          { name: 'Back to Childhood Thank You Card', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', description: 'Nostalgic souvenir greeting card', quantity: 1, category: 'Card' },
          { name: 'Lucky Card — Chance to Win ₹5,000', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80', description: 'Scratch reward card eligible for up to ₹5,000 cashback', quantity: 1, isMystery: true, category: 'Reward' }
        ],
        highlights: [
          'Packed with Nostalgia, Fun & Surprises!',
          'Relive Childhood Memories',
          'Perfect Gift for All Occasions',
          'Premium Quality Packaging',
          'Made With Love & Nostalgia'
        ],
        features: [
          '16+ Authentic Nostalgia Items',
          'Retro Water Ring Game & Bambaram',
          'Back to Childhood Thank You Card',
          'Eligible for ₹5,000 Lucky Scratch Reward'
        ],
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
        categoryName: 'Nostalgia Mystery Box',
        status: 'ACTIVE',
        isFeatured: true,
        stock: 200,
        rating: 4.9,
        numReviews: 128
      },
      {
        name: 'DD CHOCO MYSTERY BOX',
        slug: 'dd-choco-mystery-box',
        price: 199,
        originalPrice: 399,
        tag: 'CHOCO SURPRISE',
        tagline: '5 Surprise Gifts + Large Brand Chocolates!',
        description: 'The ultimate chocolate surprise mystery box loaded with large brand chocolates, 5 surprise gifts, and a chance to discover MrBeast Chocolate!',
        fullDescription: 'Indulge in rich chocolate surprises! Packed with large full-size brand chocolate bars plus 5 handpicked surprise gifts.',
        contents: [
          { name: 'Dairy Milk Large', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=300&q=80', description: 'Full size Cadbury Dairy Milk bar', quantity: 1, category: 'Chocolate' },
          { name: 'KitKat Large', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=300&q=80', description: 'Full size Nestlé KitKat 4-finger bar', quantity: 1, category: 'Chocolate' },
          { name: 'Five Star Large', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=300&q=80', description: 'Full size 5 Star chocolate bar', quantity: 1, category: 'Chocolate' },
          { name: 'Milky Bar Large', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=300&q=80', description: 'Full size white chocolate bar', quantity: 1, category: 'Chocolate' },
          { name: '5 Surprise Gifts', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd48?auto=format&fit=crop&w=300&q=80', description: '5 handpicked surprise gifts & MrBeast chance', quantity: 5, isMystery: true, category: 'Surprise' }
        ],
        highlights: [
          '5 Surprise Gifts Inside!',
          'Chance to Get MrBeast Chocolate',
          'Made With Love & Surprise',
          'Best Quality Guaranteed',
          'Fast & Safe Delivery',
          '100% Original Products'
        ],
        features: [
          'Full-size Brand Chocolates',
          '5 Handpicked Surprise Gifts',
          'Chance to win MrBeast Chocolate',
          '100% Original Guaranteed'
        ],
        image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=800&q=80',
        categoryName: 'Choco Mystery Box',
        status: 'ACTIVE',
        isFeatured: true,
        stock: 300,
        rating: 4.8,
        numReviews: 94
      }
    ]);

    console.log(`[Seed Script] ${products.length} Products Created with Box Items & Images.`);

    // 4. Create Themes
    const themes = await Theme.insertMany([
      { name: 'Marvel', category: 'Superhero', accentColor: '#ef4444', bgGradient: 'from-red-950 via-slate-900 to-red-900', isPopular: true },
      { name: 'WWE', category: 'Action & Wrestling', accentColor: '#f59e0b', bgGradient: 'from-amber-950 via-zinc-900 to-yellow-900', isPopular: true },
      { name: 'Anime', category: 'Animation', accentColor: '#8b5cf6', bgGradient: 'from-purple-950 via-indigo-900 to-violet-950', isPopular: true },
      { name: 'BGMI', category: 'Gaming', accentColor: '#10b981', bgGradient: 'from-emerald-950 via-zinc-900 to-green-900', isPopular: true },
      { name: 'Hot Wheels', category: 'Cars & Racing', accentColor: '#f97316', bgGradient: 'from-orange-950 via-neutral-900 to-red-900', isPopular: false },
      { name: 'Shinchan', category: 'Cartoons', accentColor: '#ec4899', bgGradient: 'from-pink-950 via-purple-900 to-pink-900', isPopular: true },
      { name: 'Barbie', category: 'Glamour & Cute', accentColor: '#f43f5e', bgGradient: 'from-rose-950 via-pink-900 to-rose-900', isPopular: true },
      { name: 'Gaming', category: 'Esports', accentColor: '#3b82f6', bgGradient: 'from-blue-950 via-slate-900 to-indigo-950', isPopular: false },
      { name: 'Football', category: 'Sports', accentColor: '#22c55e', bgGradient: 'from-green-950 via-teal-900 to-emerald-950', isPopular: false },
      { name: 'Cute', category: 'Kawaii & Pastel', accentColor: '#06b6d4', bgGradient: 'from-cyan-950 via-sky-900 to-teal-950', isPopular: true },
      { name: 'Luxury', category: 'Royal & Elegant', accentColor: '#eab308', bgGradient: 'from-amber-950 via-stone-900 to-yellow-950', isPopular: true }
    ]);

    console.log(`[Seed Script] ${themes.length} Themes Created.`);

    // 5. Create Inventory
    const inventory = await Inventory.insertMany([
      { itemName: 'Poppins (90s Candy)', sku: 'SKU-POPPINS', category: 'Chocolates', quantity: 300, lowStockThreshold: 30, unitPrice: 5 },
      { itemName: 'Mango Bite', sku: 'SKU-MANGO', category: 'Chocolates', quantity: 300, lowStockThreshold: 30, unitPrice: 3 },
      { itemName: 'Melody Toffee', sku: 'SKU-MELODY', category: 'Chocolates', quantity: 300, lowStockThreshold: 30, unitPrice: 4 },
      { itemName: 'Coffee Bite', sku: 'SKU-COFFEE', category: 'Chocolates', quantity: 300, lowStockThreshold: 30, unitPrice: 3 },
      { itemName: 'Boomer Bubble Gum', sku: 'SKU-BOOMER', category: 'Chocolates', quantity: 300, lowStockThreshold: 30, unitPrice: 5 },
      { itemName: 'Phantom Sweet Cigarette', sku: 'SKU-PHANTOM', category: 'Chocolates', quantity: 200, lowStockThreshold: 20, unitPrice: 10 },
      { itemName: 'Water Ring Retro Game', sku: 'SKU-RING-GAME', category: 'Toys', quantity: 150, lowStockThreshold: 20, unitPrice: 45 },
      { itemName: 'Spinning Top / Bambaram', sku: 'SKU-BAMBARAM', category: 'Toys', quantity: 150, lowStockThreshold: 20, unitPrice: 35 },
      { itemName: 'Glass Marbles Pack', sku: 'SKU-MARBLES', category: 'Toys', quantity: 250, lowStockThreshold: 30, unitPrice: 15 },
      { itemName: 'Dairy Milk Large Bar', sku: 'SKU-DAIRY-MILK', category: 'Chocolates', quantity: 200, lowStockThreshold: 25, unitPrice: 50 },
      { itemName: 'KitKat Large Bar', sku: 'SKU-KITKAT', category: 'Chocolates', quantity: 200, lowStockThreshold: 25, unitPrice: 40 },
      { itemName: 'Five Star Large Bar', sku: 'SKU-FIVESTAR', category: 'Chocolates', quantity: 200, lowStockThreshold: 25, unitPrice: 30 },
      { itemName: 'Milky Bar Large', sku: 'SKU-MILKYBAR', category: 'Chocolates', quantity: 200, lowStockThreshold: 25, unitPrice: 25 },
      { itemName: 'MrBeast Feastables Chocolate Bar', sku: 'SKU-MRBEAST', category: 'Chocolates', quantity: 25, lowStockThreshold: 5, unitPrice: 250 },
      { itemName: 'DD Signature Outer Mystery Packaging Box', sku: 'SKU-BOX-OUTER', category: 'Packaging', quantity: 500, lowStockThreshold: 50, unitPrice: 20 }
    ]);

    console.log(`[Seed Script] ${inventory.length} Inventory Items Created.`);

    // 6. Create Coupons
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 6);

    const coupons = await Coupon.insertMany([
      { code: 'FIRSTORDER10', discountType: 'percentage', discountValue: 10, minOrderAmount: 199, maxDiscount: 100, expiryDate: expiry, usageLimit: 500 },
      { code: 'BIRTHDAY20', discountType: 'percentage', discountValue: 20, minOrderAmount: 499, maxDiscount: 200, expiryDate: expiry, usageLimit: 200 },
      { code: 'WELCOME50', discountType: 'fixed', discountValue: 50, minOrderAmount: 199, maxDiscount: 50, expiryDate: expiry, usageLimit: 1000 }
    ]);

    console.log(`[Seed Script] ${coupons.length} Coupons Created.`);

    console.log('\n[Seed Script] Database re-seeding complete! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Script Error]`, error.message);
    process.exit(1);
  }
};

seedData();
