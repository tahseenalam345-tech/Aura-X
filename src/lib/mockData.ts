// Define the Shape of a Product
export interface Product {
  id: number;
  name: string;
  brand?: string; // <--- ADDED THIS LINE (Optional string)
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  thumbnails: string[]; 
  category: string;
  movement: string;
  strap: string;
  colors: string[];
  isSale: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Submariner Bluesy",
    description: "Gold & Steel with Cerachrom bezel.",
    price: 18500,
    originalPrice: 21000,
    discount: 12,
    rating: 5.0,
    reviews: 124,
    image: "/pic8.png", 
    thumbnails: ["/pic8.png", "/pic1.png", "/pic2.png"], // Added thumbnails
    category: "men",
    movement: "Automatic",
    strap: "Chain",
    colors: ["#D4AF37", "#00008B"], 
    isSale: true
  },
  {
    id: 2,
    name: "Malachite Vintage",
    description: "Emerald green dial with geometric case.",
    price: 4200,
    originalPrice: 0,
    discount: 0,
    rating: 4.8,
    reviews: 89,
    image: "/pic9.png", 
    thumbnails: ["/pic9.png", "/pic3.png", "/pic4.png"],
    category: "women",
    movement: "Quartz",
    strap: "Leather",
    colors: ["#004d35", "#D4AF37"], 
    isSale: false
  },
  {
    id: 3,
    name: "Bradshaw Chocolate",
    description: "Ceramic brown chronograph.",
    price: 6500,
    originalPrice: 8000,
    discount: 19,
    rating: 4.7,
    reviews: 210,
    image: "/pic10.png", 
    thumbnails: ["/pic10.png", "/pic5.png", "/pic6.png"],
    category: "women",
    movement: "Quartz",
    strap: "Chain",
    colors: ["#5D4037", "#B87333"], 
    isSale: true
  },
  {
    id: 4,
    name: "Ritz Rose Gold",
    description: "Pavé-studded glamour timepiece.",
    price: 5900,
    originalPrice: 6500,
    discount: 10,
    rating: 4.6,
    reviews: 56,
    image: "/pic11.png", 
    thumbnails: ["/pic11.png", "/pic7.png", "/pic1.png"],
    category: "women",
    movement: "Quartz",
    strap: "Chain",
    colors: ["#B76E79"], 
    isSale: true
  },
  {
    id: 5,
    name: "Classique Slim",
    description: "Traditional craftsmanship in rose gold.",
    price: 9800,
    originalPrice: 12000,
    discount: 18,
    rating: 4.9,
    reviews: 340,
    image: "/pic12.png", 
    thumbnails: ["/pic12.png", "/pic2.png", "/pic3.png"],
    category: "men",
    movement: "Mechanical",
    strap: "Leather",
    colors: ["#FFFFFF", "#5D4037"], 
    isSale: true
  },
  {
    id: 6,
    name: "Nordic Minimalist",
    description: "Clean silver dial with mesh strap.",
    price: 2500,
    originalPrice: 0,
    discount: 0,
    rating: 4.5,
    reviews: 98,
    image: "/pic13.png", 
    thumbnails: ["/pic13.png", "/pic4.png", "/pic5.png"],
    category: "women",
    movement: "Quartz",
    strap: "Metal",
    colors: ["#C0C0C0"], 
    isSale: false
  },
  {
    id: 7,
    name: "Datejust Jubilee",
    description: "Two-tone icon with fluted bezel.",
    price: 14500,
    originalPrice: 16000,
    discount: 9,
    rating: 5.0,
    reviews: 45,
    image: "/pic14.png", 
    thumbnails: ["/pic14.png", "/pic6.png", "/pic7.png"],
    category: "men",
    movement: "Automatic",
    strap: "Chain",
    colors: ["#C0C0C0", "#D4AF37"], 
    isSale: true
  },
  {
    id: 8,
    name: "Royal Duo Set",
    description: "Matching timepieces for him and her.",
    price: 22000,
    originalPrice: 25000,
    discount: 12,
    rating: 5.0,
    reviews: 12,
    image: "/pic14.png", 
    thumbnails: ["/pic14.png", "/pic1.png", "/pic2.png"],
    category: "couple",
    movement: "Automatic",
    strap: "Chain",
    colors: ["#D4AF37"], 
    isSale: true
  }
];