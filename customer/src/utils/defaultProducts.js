export const DEFAULT_PRODUCTS = [
  {
    _id: 'prod_90s_nostalgia',
    name: '90s Kids Nostalgia Edition',
    category: 'Nostalgia',
    price: 499,
    originalPrice: 799,
    tag: 'MOST POPULAR 🎁',
    tagline: 'Relive Your Childhood Memories!',
    rating: 4.9,
    numReviews: 142,
    description: 'Relive your childhood memories! Poppins, Boomer, Water Game, Glass Marbles, Magic Pops & 16+ nostalgic items packed in a custom birthday gift box.',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
    stock: 50,
    highlights: ['100% Original 90s Candy', 'Free Custom Birthday Greeting', 'Flexible Advance Payment Available', 'Dispatched in 24 Hours'],
    contents: [
      { name: 'Poppins Roll', description: 'Original 90s multi-color fruity candy', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=200&q=80' },
      { name: 'Boomer Bubble Gum', description: 'Classic bubble gum nostalgia', image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=200&q=80' },
      { name: 'Water Ring Toss Game', description: 'Handheld handheld water game toy', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80' },
      { name: 'Glass Marbles Set', description: 'Pack of 10 traditional glass marbles', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80' },
      { name: 'Phantom Sweet Cigarettes', description: 'Iconic mint candy sticks', image: 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=200&q=80' },
      { name: 'Magic Pop Crackling Candy', description: 'Popping candy in mouth', image: 'https://images.unsplash.com/photo-1575224300306-1b8da36134ec?auto=format&fit=crop&w=200&q=80' },
      { name: 'DD Custom Birthday Card', description: 'With recipient name & message', isMystery: false }
    ]
  },
  {
    _id: 'prod_choco_surprise',
    name: 'DD Choco Mystery Box',
    category: 'Chocolates',
    price: 199,
    originalPrice: 349,
    tag: 'BUDGET SURPRISE 🍫',
    tagline: '5 Surprise Gifts + Chance for MrBeast Chocolate!',
    rating: 4.8,
    numReviews: 98,
    description: 'Delicious chocolate mystery box with 5 surprise items + chance to get MrBeast Feastables chocolate inside!',
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80',
    stock: 100,
    highlights: ['5 Secret Chocolate Gifts', 'Chance for MrBeast Bar', 'Budget Friendly Birthday Gift', 'Flexible Advance Payment Available'],
    contents: [
      { name: 'Imported Brand Chocolates', description: 'Assorted premium chocolates', image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80' },
      { name: 'MrBeast Feastables (Chance)', description: 'Random surprise reward item in select boxes', isMystery: true },
      { name: 'Mini Birthday Surprise Toy', description: 'Collectible mini toy', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80' },
      { name: 'DD Custom Birthday Wish Card', description: 'Printed birthday wish note', isMystery: false }
    ]
  },
  {
    _id: 'prod_deluxe_birthday',
    name: 'Ultra Deluxe Birthday Mystery Box',
    category: 'Deluxe',
    price: 999,
    originalPrice: 1499,
    tag: 'ULTIMATE GIFT 👑',
    tagline: 'Custom LED Light + Name Mug + 20+ Premium Gifts!',
    rating: 5.0,
    numReviews: 76,
    description: 'The ultimate birthday surprise box! Fully customized with recipient name, custom LED light, birthday mug, chocolates & 20+ items.',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    stock: 30,
    highlights: ['Custom Name Acrylic LED Light', 'Personalized Mug', '20+ Deluxe Birthday Items', 'Flexible Advance Payment Available'],
    contents: [
      { name: 'Custom Name Acrylic LED Light', description: '3D engraved LED name lamp', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=200&q=80' },
      { name: 'Personalized Birthday Mug', description: 'Ceramic mug with custom photo & name', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80' },
      { name: '90s Nostalgia Items Pack', description: 'Assorted classic nostalgic sweets', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=200&q=80' },
      { name: 'Premium Chocolates Box', description: 'Ferrero & Cadbury luxury pack', image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=200&q=80' },
      { name: 'Party Confetti Popper', description: 'Birthday celebration pop', isMystery: false }
    ]
  }
];
