
import { Category, Vendor, Banner, Order } from './types';

export const APP_CATEGORIES: Category[] = [
  {
    id: 'events',
    name: 'Events Services',
    icon: 'PartyPopper',
    description: 'Everything you need for your special occasions.',
    subCategories: [
      { 
        id: 'event_planning', 
        name: 'Event Planning', 
        description: 'Comprehensive planning for corporate and private events.',
        subCategories: [
          { id: 'decorators', name: 'Decorators' },
          { id: 'dj', name: 'DJ & Orchestra' },
          { id: 'event_mgmt', name: 'Event Management' }
        ]
      },
      { 
        id: 'catering', 
        name: 'Catering & Food', 
        description: 'High-quality catering, bakery and confectionery services.',
        subCategories: [
          { id: 'cat_service', name: 'Catering' },
          { id: 'bakery', name: 'Bakery' },
          { id: 'confectionery', name: 'Confectionery' }
        ]
      },
      { 
        id: 'lighting', 
        name: 'Lighting & Decor',
        description: 'Professional lighting setups for all types of events.'
      }
    ]
  },
  {
    id: 'medical',
    name: 'Medical & Health',
    icon: 'Stethoscope',
    description: 'Healthcare services, clinics, and emergency support.',
    subCategories: [
      { 
        id: 'hospitals', 
        name: 'Hospitals & Clinics', 
        description: 'General hospitals, dental clinics, and specialists.',
        subCategories: [
          { id: 'hospital', name: 'Hospitals' },
          { id: 'clinic', name: 'Clinics' },
          { id: 'dentist', name: 'Dentists' },
          { id: 'skin', name: 'Skin Specialist' }
        ]
      },
      { 
        id: 'diagnostics', 
        name: 'Diagnostics', 
        description: 'Pathology labs, MRI, Sonography and imaging centers.',
        subCategories: [
          { id: 'sono', name: 'Sonography' },
          { id: 'mri', name: 'MRI' }
        ]
      },
      { id: 'pharmacy', name: 'Pharmacies', description: '24/7 Medical stores and pharmacies.' },
      { id: 'vet', name: 'Veterinary', description: 'Care for your pets and animals.' },
      { id: 'nursing', name: 'Nursing & Home Care', description: 'Professional nursing and patient care at home.' },
      { id: 'ambulance', name: 'Ambulance', description: 'Emergency transport services.' },
      { id: 'bloodbank', name: 'Blood Banks', description: 'Blood storage and donation centers.' }
    ]
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: 'Truck',
    description: 'Logistics, travel agencies, and vehicle rentals.',
    subCategories: [
      { 
        id: 'passenger', 
        name: 'Passenger Transport', 
        description: 'Buses, private cars, and travel agents for your journey.',
        subCategories: [
          { id: 'private_car', name: 'Private Cars' },
          { id: 'bus', name: 'Buses' },
          { id: 'travel_agent', name: 'Travel Agents' }
        ]
      },
      { 
        id: 'goods', 
        name: 'Goods Delivery', 
        description: 'Heavy duty trucks, tempos and pickup services.',
        subCategories: [
          { id: 'heavy', name: 'Heavy Duty' },
          { id: 'tempo', name: 'Small Tempos' },
          { id: 'pickup', name: 'Pickup Services' }
        ]
      },
      { 
        id: 'auto_service', 
        name: 'Automobile Services', 
        description: 'Repair, washing, and maintenance for your vehicles.',
        subCategories: [
          { id: 'car_service', name: 'Car Service' },
          { id: 'bike_service', name: 'Bike Service' },
          { id: 'washing', name: 'Washing Center' },
          { id: 'puncture', name: 'Tyre & Puncture' }
        ]
      }
    ]
  },
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    icon: 'Sparkles',
    description: 'Salons, spas, and fitness centers.',
    subCategories: [
      { 
        id: 'fitness', 
        name: 'Fitness', 
        description: 'Gyms, yoga classes, and zumba centers.',
        subCategories: [
          { id: 'gym', name: 'Gym' },
          { id: 'yoga', name: 'Yoga' },
          { id: 'zumba', name: 'Zumba' }
        ]
      },
      { 
        id: 'salon', 
        name: 'Salons & Spas', 
        description: 'Beauty parlours, hair salons, and massage therapies.',
        subCategories: [
          { id: 'beauty_parlour', name: 'Beauty Parlour' },
          { id: 'massage', name: 'Spa & Massage' }
        ]
      }
    ]
  },
  {
    id: 'home',
    name: 'Home & Maintenance',
    icon: 'Hammer',
    description: 'Repairs, renovations, and handyman services.',
    subCategories: [
      { 
        id: 'handyman', 
        name: 'Handyman', 
        description: 'Plumbers, electricians, and carpenters.',
        subCategories: [
          { id: 'plumber', name: 'Plumber' },
          { id: 'electrician', name: 'Electrician' },
          { id: 'carpenter', name: 'Carpenter' }
        ]
      },
      { id: 'interior', name: 'Interior Design', description: 'Make your home beautiful with expert designers.' },
      { 
        id: 'appliance', 
        name: 'Appliance Repair', 
        description: 'Repair services for AC, fridge, ovens, and more.',
        subCategories: [
          { id: 'ac_repair', name: 'AC & Fridge' },
          { id: 'oven', name: 'Oven & Mixer' }
        ]
      },
      { 
        id: 'electronic', 
        name: 'Electronic Repair', 
        description: 'Fixing laptops, computers, and mobile phones.',
        subCategories: [
          { id: 'laptop', name: 'Laptop/PC' },
          { id: 'phone', name: 'Mobile Phone' }
        ]
      }
    ]
  },
  {
    id: 'housekeeping',
    name: 'Housekeeping',
    icon: 'SprayCan',
    description: 'Maids, cooks, and daily utility supplies.',
    subCategories: [
      { 
        id: 'domestic', 
        name: 'Domestic Help', 
        description: 'Find maids, cooks, and house servants.',
        subCategories: [
          { id: 'maid', name: 'Maids & Cooks' },
          { id: 'servant', name: 'House Servant' }
        ]
      },
      { 
        id: 'daily_needs', 
        name: 'Daily Needs', 
        description: 'Milk, water supply, and security personnel.',
        subCategories: [
          { id: 'milk', name: 'Milk Supply' },
          { id: 'water', name: 'Water Supply' },
          { id: 'watchman', name: 'Watchman' }
        ]
      }
    ]
  },
  {
    id: 'food',
    name: 'Food & Beverages',
    icon: 'Utensils',
    description: 'Restaurants, cafes, and street food.',
    subCategories: [
      { id: 'restaurant', name: 'Restaurants', description: 'Dine-in and delivery options.' },
      { id: 'beverage', name: 'Beverages', description: 'Cafes, tea stalls, and juice bars.' }
    ]
  },
  {
    id: 'accom',
    name: 'Accommodation',
    icon: 'Hotel',
    description: 'Hotels, lodges, and guest houses.',
    subCategories: [
      { id: 'hotel', name: 'Hotels', description: 'Comfortable stays and lodgings.' },
      { id: 'agro', name: 'Agro Tourism', description: 'Experience farm life and nature.' }
    ]
  }
];

export const INITIAL_BANNERS: Banner[] = [
  { id: '1', imageUrl: 'https://picsum.photos/1200/300?random=1', link: '#', altText: 'Big Sale on Home Services' },
  { id: '2', imageUrl: 'https://picsum.photos/1200/300?random=2', link: '#', altText: 'Wedding Season Discounts' },
  { id: '3', imageUrl: 'https://picsum.photos/1200/300?random=3', link: '#', altText: 'Get Fit with Local Gyms' },
];

export const MOCK_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Elite Event Planners',
    categoryIds: ['event_mgmt', 'decorators'],
    description: 'Premier event planning for weddings and corporate galas.',
    rating: 4.8,
    location: { lat: 40.7128, lng: -74.0060, address: '123 Main St, Downtown' },
    contact: '+19998887777',
    maskedContact: '+1 (555) 000-0001',
    isVerified: true,
    isApproved: true,
    imageUrl: 'https://picsum.photos/300/200?random=10',
    priceStart: 500,
    email: 'elite@events.com',
    products: [
      { name: 'Wedding Package', price: 50000 },
      { name: 'Birthday Basic', price: 15000 }
    ]
  },
  {
    id: 'v2',
    name: 'City General Hospital',
    categoryIds: ['hospitals'],
    description: '24/7 Emergency and specialized care.',
    rating: 4.5,
    location: { lat: 40.7150, lng: -74.0090, address: '45 Health Ave' },
    contact: '+19998887778',
    maskedContact: '+1 (555) 000-0002',
    isVerified: true,
    isApproved: true,
    imageUrl: 'https://picsum.photos/300/200?random=11',
    priceStart: 100,
    email: 'info@cityhospital.com',
    products: [
      { name: 'General Consultation', price: 500 },
      { name: 'Dental Checkup', price: 800 }
    ]
  },
  {
    id: 'v3',
    name: 'Quick Fix Plumbers',
    categoryIds: ['plumber'],
    description: 'Expert plumbing services within 30 mins.',
    rating: 4.2,
    location: { lat: 40.7100, lng: -74.0030, address: '88 Pipe Lane' },
    contact: '+19998887779',
    maskedContact: '+1 (555) 000-0003',
    isVerified: true,
    isApproved: true,
    imageUrl: 'https://picsum.photos/300/200?random=12',
    priceStart: 50,
    email: 'fix@plumbers.com',
    products: [
      { name: 'Tap Repair', price: 150 },
      { name: 'Pipe Fitting', price: 500 }
    ]
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o1',
    vendorId: 'v1',
    customerName: 'Rahul Sharma',
    customerPhone: '9876543210',
    serviceRequested: 'Wedding Decoration',
    date: '2024-05-15',
    status: 'PENDING',
    address: 'Plot 45, Green Valley, Dahanu',
    amount: 15000
  },
  {
    id: 'o2',
    vendorId: 'v1',
    customerName: 'Priya Patel',
    customerPhone: '9876543211',
    serviceRequested: 'Birthday Party Mgmt',
    date: '2024-05-18',
    status: 'ACCEPTED',
    address: '101, Ocean View Apts, Dahanu',
    amount: 5000
  }
];