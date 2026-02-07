export interface Review {
  id: number;
  user: string;
  rating: number;
  date: string;
  comment: string;
  image?: string | null; // Optional user uploaded photo
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  images: string[];
  colors?: { name: string; hex: string; image: string }[];
  tagline: string;
  stock: "In Stock" | "Limited Stock" | "Out of Stock";
  specs: {
    type: string;
    material: string;
    design: string;
    gender: string;
    movement: string;
    case: string;
    water: string;
    glass: string;
    strap: string;
  };
  description: string;
  reviews: number;
  rating: number;
  reviewsList?: Review[]; // The new reviews array
}

export const products: Product[] = [
  {
    id: "1",
    name: "Rolex Submariner Date",
    price: 18500,
    originalPrice: 21000,
    category: "men",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop"
    ],
    colors: [
      { 
        name: "Royal Blue", 
        hex: "#1a237e", 
        image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop" 
      },
      { 
        name: "Emerald Green", 
        hex: "#004d40", 
        image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop" 
      },
      { 
        name: "Oyster Black", 
        hex: "#000000", 
        image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop" 
      }
    ],
    tagline: "The Reference Among Divers' Watches",
    stock: "In Stock",
    specs: {
      type: "Analog",
      material: "Stainless Steel & Gold",
      design: "Luxury",
      gender: "Men",
      movement: "Automatic 3235",
      case: "41mm Oystersteel",
      water: "300m / 1000ft",
      glass: "Sapphire Crystal",
      strap: "Oyster Bracelet",
    },
    description: "The Rolex Submariner Date in Oystersteel and yellow gold with a Cerachrom bezel insert in blue ceramic and a royal blue dial. It features large luminescent hour markers.",
    reviews: 124,
    rating: 5.0,
    reviewsList: [
      {
        id: 1,
        user: "Ali Khan",
        rating: 5,
        date: "Oct 12, 2025",
        comment: "Absolutely stunning watch! The gold finish is premium and looks exactly like the pictures.",
        image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=200&auto=format&fit=crop"
      },
      {
        id: 2,
        user: "Sarah Ahmed",
        rating: 4,
        date: "Nov 05, 2025",
        comment: "Great quality for the price. Delivery took 3 days to Lahore.",
        image: null
      },
      {
        id: 3,
        user: "Bilal Sheikh",
        rating: 5,
        date: "Jan 10, 2026",
        comment: "Best investment. The movement is smooth and the weight feels authentic.",
        image: null
      }
    ]
  },
  {
    id: "2",
    name: "Malachite Vintage Square",
    price: 4200,
    originalPrice: 5500,
    category: "women",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1000&auto=format&fit=crop",
    images: [
       "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1000&auto=format&fit=crop",
       "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop"
    ],
    colors: [
       { name: "Malachite Green", hex: "#2E7D32", image: "https://images.unsplash.com/photo-1590736969955-71cc94801759?q=80&w=1000&auto=format&fit=crop" },
       { name: "Classic Black", hex: "#000000", image: "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop" }
    ],
    tagline: "Emerald Elegance for Her",
    stock: "Limited Stock",
    specs: {
      type: "Quartz",
      material: "Gold Plated",
      design: "Formal",
      gender: "Women",
      movement: "Swiss Quartz",
      case: "28mm Square",
      water: "30m",
      glass: "Mineral Glass",
      strap: "Genuine Leather",
    },
    description: "A timeless classic featuring a stunning Malachite green dial and a vintage square case. Perfect for evening wear.",
    reviews: 89,
    rating: 4.8,
    reviewsList: [
      {
        id: 1,
        user: "Ayesha Bibi",
        rating: 5,
        date: "Dec 20, 2025",
        comment: "It looks so vintage and classy. The green dial pops beautifully.",
        image: "https://images.unsplash.com/photo-1619134778706-7015533a6150?q=80&w=200&auto=format&fit=crop"
      },
      {
        id: 2,
        user: "Fatima Noor",
        rating: 5,
        date: "Jan 02, 2026",
        comment: "Packaging was amazing. Felt like unboxing a jewel.",
        image: null
      }
    ]
  },
  {
    id: "3",
    name: "Bradshaw Chocolate Chrono",
    price: 6500,
    originalPrice: 8000,
    category: "men",
    image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620625515032-608143206dfd?q=80&w=1000&auto=format&fit=crop"
    ],
    colors: [
      { name: "Chocolate Brown", hex: "#5D4037", image: "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?q=80&w=1000&auto=format&fit=crop" },
      { name: "Midnight Black", hex: "#212121", image: "https://images.unsplash.com/photo-1620625515032-608143206dfd?q=80&w=1000&auto=format&fit=crop" }
    ],
    tagline: "Bold & Sophisticated",
    stock: "Out of Stock",
    specs: {
      type: "Chronograph",
      material: "Stainless Steel",
      design: "Casual",
      gender: "Men",
      movement: "Quartz Chrono",
      case: "44mm",
      water: "50m",
      glass: "Hardlex",
      strap: "Metal Chain",
    },
    description: "Designed for the bold, this chocolate-toned chronograph features a roman numeral dial and a heavy metal bracelet.",
    reviews: 45,
    rating: 4.7,
    reviewsList: [
      {
        id: 1,
        user: "Hamza R.",
        rating: 4,
        date: "Nov 15, 2025",
        comment: "Very heavy watch, feels premium. But the chain was a bit loose, had to adjust it.",
        image: null
      },
      {
        id: 2,
        user: "Usman Ghani",
        rating: 5,
        date: "Dec 05, 2025",
        comment: "The color is unique. Not many brown watches in the market look this good.",
        image: null
      }
    ]
  },
  {
    id: "4",
    name: "Ritz Rose Gold Glitz",
    price: 5900,
    originalPrice: 7200,
    category: "women",
    image: "https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=1000&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000&auto=format&fit=crop"
    ],
    colors: [
      { name: "Rose Gold", hex: "#E0BFB8", image: "https://images.unsplash.com/photo-1517260739337-6799d239ce83?q=80&w=1000&auto=format&fit=crop" },
      { name: "Silver Sparkle", hex: "#E0E0E0", image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000&auto=format&fit=crop" }
    ],
    tagline: "Shine Bright Like a Diamond",
    stock: "In Stock",
    specs: {
      type: "Analog",
      material: "Rose Gold Plating",
      design: "Luxury",
      gender: "Women",
      movement: "Quartz",
      case: "37mm",
      water: "30m",
      glass: "Crystal",
      strap: "Stainless Steel",
    },
    description: "A stunning rose gold timepiece embellished with pavé crystals for the ultimate glamour statement.",
    reviews: 210,
    rating: 4.6,
    reviewsList: [
      {
        id: 1,
        user: "Zara K.",
        rating: 5,
        date: "Jan 12, 2026",
        comment: "It sparkles so much in the light! Love it.",
        image: "https://images.unsplash.com/photo-1512149590705-18aa5a828693?q=80&w=200&auto=format&fit=crop"
      },
      {
        id: 2,
        user: "Hina Altaf",
        rating: 3,
        date: "Feb 01, 2026",
        comment: "Good watch but smaller than I expected.",
        image: null
      },
      {
        id: 3,
        user: "Maha",
        rating: 5,
        date: "Feb 03, 2026",
        comment: "Perfect gift for my sister's wedding.",
        image: null
      }
    ]
  }
];