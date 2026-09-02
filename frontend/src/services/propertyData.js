// Default curated luxury properties for Kaveri Stays
export const DEFAULT_PROPERTIES = [
  {
    property_id: 1,
    name: 'Kaveri Riverside',
    city: 'Coorg',
    stars: 4,
    total_rooms: 18,
    image: '/resort_coorg.webp',
    description: 'Secluded riverside sanctuary along the Kaveri river amidst lush rainforests and misty coffee estates with private infinity pool.'
  },
  {
    property_id: 2,
    name: 'Kaveri Hilltop',
    city: 'Ooty',
    stars: 5,
    total_rooms: 14,
    image: '/resort_ooty.webp',
    description: 'High-altitude luxury chalet perched on panoramic mountain ridges overlooking rolling emerald tea plantations with heated cliffside infinity pool.'
  },
  {
    property_id: 3,
    name: 'Kaveri Backwater',
    city: 'Alleppey',
    stars: 4,
    total_rooms: 12,
    image: '/resort_alleppey.webp',
    description: 'Tranquil waterfront estate along serene Kerala lagoons with private plunge pools, traditional wooden architecture, and sunset houseboat docks.'
  }
];

export const DEFAULT_ROOM_TYPES = [
  { room_type_id: 1, type_name: 'Deluxe', max_occupancy: 4, base_rate: 4500 },
  { room_type_id: 2, type_name: 'Suite', max_occupancy: 4, base_rate: 8200 },
  { room_type_id: 3, type_name: 'Standard', max_occupancy: 4, base_rate: 3200 },
];

export const DEFAULT_ROOMS = [
  // Kaveri Riverside (Coorg)
  { room_id: 101, property_id: 1, property_name: 'Kaveri Riverside', room_number: '101', room_type_name: 'Deluxe', max_occupancy: 2, rate: 4500 },
  { room_id: 102, property_id: 1, property_name: 'Kaveri Riverside', room_number: '102', room_type_name: 'Deluxe', max_occupancy: 4, rate: 4500 },
  { room_id: 103, property_id: 1, property_name: 'Kaveri Riverside', room_number: '103', room_type_name: 'Standard', max_occupancy: 4, rate: 3200 },
  { room_id: 104, property_id: 1, property_name: 'Kaveri Riverside', room_number: '104', room_type_name: 'Standard', max_occupancy: 2, rate: 3200 },
  { room_id: 105, property_id: 1, property_name: 'Kaveri Riverside', room_number: '105', room_type_name: 'Suite', max_occupancy: 2, rate: 7900 },

  // Kaveri Hilltop (Ooty)
  { room_id: 201, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '201', room_type_name: 'Suite', max_occupancy: 3, rate: 8200 },
  { room_id: 202, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '202', room_type_name: 'Deluxe', max_occupancy: 2, rate: 6800 },
  { room_id: 203, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '203', room_type_name: 'Deluxe', max_occupancy: 2, rate: 6800 },
  { room_id: 204, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '204', room_type_name: 'Standard', max_occupancy: 1, rate: 5400 },
  { room_id: 205, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '205', room_type_name: 'Deluxe', max_occupancy: 2, rate: 6800 },

  // Kaveri Backwater (Alleppey)
  { room_id: 301, property_id: 3, property_name: 'Kaveri Backwater', room_number: '301', room_type_name: 'Deluxe', max_occupancy: 3, rate: 5100 },
  { room_id: 302, property_id: 3, property_name: 'Kaveri Backwater', room_number: '302', room_type_name: 'Deluxe', max_occupancy: 2, rate: 5100 },
  { room_id: 303, property_id: 3, property_name: 'Kaveri Backwater', room_number: '303', room_type_name: 'Suite', max_occupancy: 2, rate: 9500 },
  { room_id: 304, property_id: 3, property_name: 'Kaveri Backwater', room_number: '304', room_type_name: 'Standard', max_occupancy: 2, rate: 3900 },
];

export const PROPERTY_IMAGES_MAP = {
  'Kaveri Riverside': '/resort_coorg.webp',
  'Kaveri Hilltop': '/resort_ooty.webp',
  'Kaveri Backwater': '/resort_alleppey.webp',
  'Kaveri Backwaters': '/resort_alleppey.webp',
};

export const getPropertyImage = (name, city = '') => {
  const norm = (name || '').toLowerCase();
  const cityNorm = (city || '').toLowerCase();

  if (norm.includes('riverside') || cityNorm.includes('coorg')) return '/resort_coorg.webp';
  if (norm.includes('hilltop') || cityNorm.includes('ooty')) return '/resort_ooty.webp';
  if (norm.includes('backwater') || cityNorm.includes('alleppey')) return '/resort_alleppey.webp';
  
  return '/hero_resort.webp';
};
