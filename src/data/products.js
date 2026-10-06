// Top-level departments shown in the navbar; each has sub-categories used as filters.
export const departments = [
  {
    slug: 'jewellery',
    name: 'Jewellery',
    icon: '💍',
    tagline: 'Certified gold, diamonds and gemstones.',
    categories: [
      { slug: 'rings', name: 'Rings', icon: '💍' },
      { slug: 'necklaces', name: 'Necklaces', icon: '📿' },
      { slug: 'earrings', name: 'Earrings', icon: '✨' },
      { slug: 'bracelets', name: 'Bracelets', icon: '🔗' },
      { slug: 'bangles', name: 'Bangles', icon: '⭕' },
      { slug: 'pendants', name: 'Pendants', icon: '💎' },
    ],
  },
  {
    slug: 'decorative-items',
    name: 'Decorative Items',
    icon: '🏺',
    tagline: 'Handcrafted pieces to brighten every corner of your home.',
    categories: [
      { slug: 'idols', name: 'Idols & Figurines', icon: '🪔' },
      { slug: 'vases', name: 'Vases', icon: '🏺' },
      { slug: 'wall-decor', name: 'Wall Decor', icon: '🖼️' },
      { slug: 'candle-holders', name: 'Candle Holders', icon: '🕯️' },
      { slug: 'showpieces', name: 'Showpieces', icon: '🦚' },
    ],
  },
];

// Set `image` to a real product image URL (or load products from your API).
// When empty, a styled placeholder is shown instead.
export const products = [
  // Jewellery
  { id: 1, department: 'jewellery', category: 'rings', name: 'Solitaire Diamond Ring', material: '18K White Gold', price: 54999, rating: 4.8, image: '', description: 'A timeless round-cut solitaire set in a classic four-prong 18K white gold band.' },
  { id: 2, department: 'jewellery', category: 'rings', name: 'Rose Gold Floral Ring', material: '14K Rose Gold', price: 18499, rating: 4.5, image: '', description: 'Delicate floral motif studded with tiny cubic zirconia stones.' },
  { id: 3, department: 'jewellery', category: 'rings', name: 'Emerald Cocktail Ring', material: '22K Yellow Gold', price: 72999, rating: 4.7, image: '', description: 'A statement emerald centre stone surrounded by a halo of diamonds.' },
  { id: 4, department: 'jewellery', category: 'necklaces', name: 'Kundan Choker Necklace', material: '22K Gold Plated', price: 32999, rating: 4.6, image: '', description: 'Traditional kundan work choker, perfect for weddings and festive occasions.' },
  { id: 5, department: 'jewellery', category: 'necklaces', name: 'Pearl Strand Necklace', material: 'Sterling Silver', price: 12999, rating: 4.4, image: '', description: 'Elegant single strand of freshwater pearls with a silver clasp.' },
  { id: 6, department: 'jewellery', category: 'necklaces', name: 'Temple Gold Necklace', material: '22K Yellow Gold', price: 145999, rating: 4.9, image: '', description: 'Handcrafted temple jewellery featuring intricate deity motifs.' },
  { id: 7, department: 'jewellery', category: 'earrings', name: 'Diamond Stud Earrings', material: '18K Yellow Gold', price: 28999, rating: 4.8, image: '', description: 'Brilliant-cut diamond studs for everyday sparkle.' },
  { id: 8, department: 'jewellery', category: 'earrings', name: 'Jhumka Earrings', material: '22K Gold', price: 38499, rating: 4.7, image: '', description: 'Classic bell-shaped jhumkas with pearl drops.' },
  { id: 9, department: 'jewellery', category: 'earrings', name: 'Hoop Earrings', material: '14K Rose Gold', price: 9999, rating: 4.3, image: '', description: 'Lightweight, polished hoops that go with everything.' },
  { id: 10, department: 'jewellery', category: 'bracelets', name: 'Tennis Bracelet', material: '18K White Gold', price: 89999, rating: 4.9, image: '', description: 'A continuous line of matched diamonds in a flexible setting.' },
  { id: 11, department: 'jewellery', category: 'bracelets', name: 'Charm Bracelet', material: 'Sterling Silver', price: 6499, rating: 4.2, image: '', description: 'Silver chain bracelet with five removable charms.' },
  { id: 12, department: 'jewellery', category: 'bangles', name: 'Antique Gold Bangles (Set of 2)', material: '22K Gold', price: 98999, rating: 4.8, image: '', description: 'Antique-finish bangles with fine filigree detailing.' },
  { id: 13, department: 'jewellery', category: 'bangles', name: 'Diamond Kada', material: '18K Yellow Gold', price: 124999, rating: 4.6, image: '', description: 'Bold kada with a row of pavé-set diamonds.' },
  { id: 14, department: 'jewellery', category: 'pendants', name: 'Heart Diamond Pendant', material: '18K Rose Gold', price: 15999, rating: 4.5, image: '', description: 'Heart-shaped pendant with a diamond outline, chain included.' },
  { id: 15, department: 'jewellery', category: 'pendants', name: 'Om Gold Pendant', material: '22K Gold', price: 11499, rating: 4.7, image: '', description: 'Auspicious Om pendant in polished 22K gold.' },
  { id: 16, department: 'jewellery', category: 'pendants', name: 'Ruby Drop Pendant', material: '18K White Gold', price: 26999, rating: 4.6, image: '', description: 'Pear-shaped ruby suspended from a diamond bail.' },

  // Decorative items
  { id: 101, department: 'decorative-items', category: 'idols', name: 'Brass Ganesha Idol', material: 'Brass', price: 3499, rating: 4.8, image: '', description: 'Hand-cast brass Ganesha with antique finish, 8 inches tall.' },
  { id: 102, department: 'decorative-items', category: 'idols', name: 'Silver Plated Lakshmi Idol', material: 'Silver Plated', price: 6999, rating: 4.7, image: '', description: 'Silver-plated Lakshmi idol, ideal for your pooja room or gifting.' },
  { id: 103, department: 'decorative-items', category: 'idols', name: 'Marble Buddha Figurine', material: 'Marble', price: 4999, rating: 4.6, image: '', description: 'Serene meditating Buddha carved from white marble.' },
  { id: 104, department: 'decorative-items', category: 'vases', name: 'Hand-painted Ceramic Vase', material: 'Ceramic', price: 1899, rating: 4.4, image: '', description: 'Blue pottery-inspired vase, hand-painted by artisans.' },
  { id: 105, department: 'decorative-items', category: 'vases', name: 'Brass Etched Flower Vase', material: 'Brass', price: 2799, rating: 4.5, image: '', description: 'Tall brass vase with intricate etched floral patterns.' },
  { id: 106, department: 'decorative-items', category: 'wall-decor', name: 'Peacock Metal Wall Art', material: 'Iron', price: 5499, rating: 4.6, image: '', description: 'Colourful hand-painted peacock wall panel, 36 inches wide.' },
  { id: 107, department: 'decorative-items', category: 'wall-decor', name: 'Wooden Mandala Wall Plate', material: 'Wood', price: 2299, rating: 4.3, image: '', description: 'Laser-cut sheesham wood mandala for living room walls.' },
  { id: 108, department: 'decorative-items', category: 'candle-holders', name: 'Brass Diya Stand', material: 'Brass', price: 2499, rating: 4.7, image: '', description: 'Five-wick traditional diya stand for festive décor.' },
  { id: 109, department: 'decorative-items', category: 'candle-holders', name: 'Glass Hurricane Candle Holder', material: 'Glass', price: 1299, rating: 4.2, image: '', description: 'Clear glass hurricane with a gold-finished base.' },
  { id: 110, department: 'decorative-items', category: 'showpieces', name: 'Silver Elephant Pair', material: 'Silver Plated', price: 8999, rating: 4.8, image: '', description: 'A pair of silver-plated elephants with raised trunks for good luck.' },
  { id: 111, department: 'decorative-items', category: 'showpieces', name: 'Wooden Horse Showpiece', material: 'Wood', price: 1999, rating: 4.4, image: '', description: 'Hand-carved wooden horse with brass inlay work.' },
];
