import bcrypt from 'bcryptjs';
import { connectDb, disconnectDb } from '../db';
import { config } from '../config';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { AddOn } from '../models/AddOn';
import { BusinessSettings } from '../models/BusinessSettings';
import { rupeesToPaise } from '@tiffin/shared';

async function seed() {
  await connectDb();
  console.log('Seeding and updating platform data...');

  if (!(await BusinessSettings.findOne())) {
    await BusinessSettings.create({});
    console.log('Created business settings');
  }

  // 1. Admin User: Ayush Dwivedi (6261568086 / ayushdwivedi7502@gmail.com)
  const adminPhone = '6261568086';
  const adminEmail = 'ayushdwivedi7502@gmail.com';
  const adminPassHash = await bcrypt.hash('ChangeMeAdmin123!', 12);

  let admin = await User.findOne({ phone: adminPhone });
  if (!admin) {
    admin = await User.create({
      role: 'admin',
      fullName: 'Ayush Dwivedi (Owner & Admin)',
      phone: adminPhone,
      email: adminEmail,
      passwordHash: adminPassHash,
    });
    console.log(`Admin created: ${adminEmail} / phone ${adminPhone}`);
  } else {
    admin.role = 'admin';
    admin.fullName = 'Ayush Dwivedi (Owner & Admin)';
    admin.email = adminEmail;
    admin.passwordHash = adminPassHash;
    await admin.save();
    console.log(`Admin updated: ${adminEmail} / phone ${adminPhone}`);
  }

  // 2. Worker / Delivery Partner User
  const workerPhone = '9876543210';
  const workerEmail = 'worker@jabalpurtiffin.in';
  let worker = await User.findOne({ phone: workerPhone });
  if (!worker) {
    worker = await User.create({
      role: 'worker',
      fullName: 'Ramesh Kumar (Delivery & Kitchen Staff)',
      phone: workerPhone,
      email: workerEmail,
      passwordHash: await bcrypt.hash('Worker@123', 12),
    });
    console.log(`Worker created: phone ${workerPhone}`);
  } else {
    worker.role = 'worker';
    worker.fullName = 'Ramesh Kumar (Delivery & Kitchen Staff)';
    await worker.save();
    console.log(`Worker updated: phone ${workerPhone}`);
  }

  // 3. Demo Customer
  const custPhone = '9999999999';
  let customer = await User.findOne({ phone: custPhone });
  if (!customer) {
    customer = await User.create({
      role: 'customer',
      fullName: 'Rahul Sharma (Customer Demo)',
      phone: custPhone,
      email: 'customer@demo.local',
      passwordHash: await bcrypt.hash('Customer@123', 12),
    });
    console.log(`Customer created: phone ${custPhone}`);
  }

  // 4. Plans - Ensure all plans exist and are active
  await Plan.deleteMany({});
  await Plan.insertMany([
    {
      name: 'Single Meal Trial Plan',
      description: '1 समय का ताजा भोजन (लंच या डिनर)। स्टूडेंट्स, हॉस्टल और नए कस्टमर्स के लिए बेस्ट ट्रायल प्लान।',
      includedItems: ['4 तवा रोटी (देसी घी)', '1 मौसमी सब्जी', 'दाल फ्राई', 'जीरा राइस', 'सलाद व अचार'],
      mealType: 'single_meal',
      pricePaise: rupeesToPaise(80),
      durationType: 'weekly',
      deliverOnWeekdaysOnly: false,
      advanceFixedPaise: rupeesToPaise(80),
      discountPercent: 0,
      isActive: true,
    },
    {
      name: 'Weekly Lunch Only Plan',
      description: '7-दिन दोपहर का पौष्टिक टिफिन। कॉलेज छात्र और ऑफिस जाने वालों के लिए बेहद लोकप्रिय।',
      includedItems: ['4 रोटी', 'दाल तड़का', '1 हरी/मौसमी सब्जी', 'स्टीम्ड राइस', 'सलाद'],
      mealType: 'lunch_only',
      pricePaise: rupeesToPaise(700),
      durationType: 'weekly',
      deliverOnWeekdaysOnly: false,
      advanceFixedPaise: rupeesToPaise(200),
      discountPercent: 5,
      isActive: true,
    },
    {
      name: 'Monthly Lunch Only',
      description: 'पूरे महीने (30 दिन) दोपहर 12:30 बजे गरमा-गरम घर जैसा पौष्टिक टिफिन समय पर डिलीवरी।',
      includedItems: ['4 तवा रोटी', 'दाल फ्राई', 'शाही/मौसमी सब्जी', 'जीरा राइस', 'सलाद', 'पापड़'],
      mealType: 'lunch_only',
      pricePaise: rupeesToPaise(2400),
      durationType: 'monthly',
      deliverOnWeekdaysOnly: false,
      advanceFixedPaise: rupeesToPaise(500),
      discountPercent: 10,
      isActive: true,
    },
    {
      name: 'Monthly Dinner Only',
      description: 'पूरे महीने रात 8:00 बजे शुद्ध, हल्का और सुपाच्य भोजन सीधे आपके कमरे/घर पर।',
      includedItems: ['4 ताजी रोटी', 'दाल तड़का', 'पनीर/सब्जी', 'पुलाव/चावल', 'सलाद'],
      mealType: 'dinner_only',
      pricePaise: rupeesToPaise(2400),
      durationType: 'monthly',
      deliverOnWeekdaysOnly: false,
      advanceFixedPaise: rupeesToPaise(500),
      discountPercent: 10,
      isActive: true,
    },
    {
      name: 'Monthly Lunch + Dinner Combo Deluxe',
      description: 'दोनों समय का संपूर्ण स्वादिष्ट और पौष्टिक भोजन। सबसे ज्यादा बचत और परिवार/छात्रों की पहली पसंद।',
      includedItems: ['4 रोटी (प्रत्येक मील)', '2 तरह की स्वादिष्ट सब्जी', 'दाल तड़का', 'बासमती राइस', 'संडे स्पेशल स्वीट', 'सलाद व रायता'],
      mealType: 'lunch_and_dinner',
      pricePaise: rupeesToPaise(4500),
      durationType: 'monthly',
      deliverOnWeekdaysOnly: false,
      advanceFixedPaise: rupeesToPaise(1000),
      discountPercent: 15,
      isActive: true,
    },
  ]);
  console.log('5 All-Star Jabalpur Tiffin Plans successfully seeded!');

  // 5. Sample Add-ons
  const addonCount = await AddOn.countDocuments();
  if (addonCount === 0) {
    await AddOn.insertMany([
      { name: 'Extra Roti (4 pcs)', description: '4 additional hot tawa rotis', pricePaise: rupeesToPaise(20), mealSlots: ['lunch', 'dinner'] },
      { name: 'Extra Sabzi', description: 'Additional bowl of fresh seasonal sabzi', pricePaise: rupeesToPaise(40), mealSlots: ['lunch', 'dinner'] },
      { name: 'Special Paneer Sabzi', description: 'Portion of Shahi/Kadhai Paneer', pricePaise: rupeesToPaise(70), mealSlots: ['lunch', 'dinner'] },
      { name: 'Extra Full Tiffin Meal', description: 'Complete extra single tiffin meal', pricePaise: rupeesToPaise(80), mealSlots: ['lunch', 'dinner'] },
    ]);
    console.log('Sample add-ons created');
  }

  await disconnectDb();
  console.log('Seed completed successfully!');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
