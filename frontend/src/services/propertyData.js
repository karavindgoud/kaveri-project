// Default curated luxury properties for Kaveri Stays
export const DEFAULT_PROPERTIES = [
  {
    property_id: 1,
    name: 'Kaveri Riverside',
    city: 'Coorg',
    stars: 5,
    total_rooms: 18,
    image: '/resort_coorg.jpg',
    description: 'Secluded riverside sanctuary along the Kaveri river amidst lush rainforests and misty coffee estates with private infinity pool.'
  },
  {
    property_id: 2,
    name: 'Kaveri Hilltop',
    city: 'Ooty',
    stars: 5,
    total_rooms: 14,
    image: '/resort_ooty.jpg',
    description: 'High-altitude luxury chalet perched on panoramic mountain ridges overlooking rolling emerald tea plantations with heated cliffside infinity pool.'
  },
  {
    property_id: 3,
    name: 'Kaveri Backwaters',
    city: 'Alleppey',
    stars: 5,
    total_rooms: 12,
    image: '/resort_alleppey.jpg',
    description: 'Tranquil waterfront estate along serene Kerala lagoons with private plunge pools, traditional wooden architecture, and sunset houseboat docks.'
  }
];

export const DEFAULT_ROOM_TYPES = [
  { room_type_id: 1, type_name: 'Presidential Infinity Villa', max_occupancy: 4, base_rate: 650 },
  { room_type_id: 2, type_name: 'Royal Panorama Suite', max_occupancy: 2, base_rate: 450 },
  { room_type_id: 3, type_name: 'Deluxe Heritage Chalet', max_occupancy: 3, base_rate: 320 },
];

export const DEFAULT_ROOMS = [
  // Kaveri Riverside (Coorg)
  { room_id: 101, property_id: 1, property_name: 'Kaveri Riverside', room_number: '101', room_type_name: 'Presidential Infinity Villa', max_occupancy: 4, rate: 650 },
  { room_id: 102, property_id: 1, property_name: 'Kaveri Riverside', room_number: '102', room_type_name: 'Royal Panorama Suite', max_occupancy: 2, rate: 450 },
  { room_id: 103, property_id: 1, property_name: 'Kaveri Riverside', room_number: '103', room_type_name: 'Deluxe Heritage Chalet', max_occupancy: 3, rate: 320 },

  // Kaveri Hilltop (Ooty)
  { room_id: 201, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '201', room_type_name: 'Presidential Infinity Villa', max_occupancy: 4, rate: 720 },
  { room_id: 202, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '202', room_type_name: 'Royal Panorama Suite', max_occupancy: 2, rate: 480 },
  { room_id: 203, property_id: 2, property_name: 'Kaveri Hilltop', room_number: '203', room_type_name: 'Deluxe Heritage Chalet', max_occupancy: 3, rate: 380 },

  // Kaveri Backwaters (Alleppey)
  { room_id: 301, property_id: 3, property_name: 'Kaveri Backwaters', room_number: '301', room_type_name: 'Presidential Infinity Villa', max_occupancy: 4, rate: 680 },
  { room_id: 302, property_id: 3, property_name: 'Kaveri Backwaters', room_number: '302', room_type_name: 'Royal Panorama Suite', max_occupancy: 2, rate: 450 },
  { room_id: 303, property_id: 3, property_name: 'Kaveri Backwaters', room_number: '303', room_type_name: 'Deluxe Heritage Chalet', max_occupancy: 3, rate: 320 },
];

export const PROPERTY_IMAGES_MAP = {
  'Kaveri Riverside': '/resort_coorg.jpg',
  'Kaveri Hilltop': '/resort_ooty.jpg',
  'Kaveri Backwaters': '/resort_alleppey.jpg',
};

export const getPropertyImage = (name, city = '') => {
  const norm = (name || '').toLowerCase();
  const cityNorm = (city || '').toLowerCase();

  if (norm.includes('riverside') || cityNorm.includes('coorg')) return '/resort_coorg.jpg';
  if (norm.includes('hilltop') || cityNorm.includes('ooty')) return '/resort_ooty.jpg';
  if (norm.includes('backwater') || cityNorm.includes('alleppey')) return '/resort_alleppey.jpg';
  
  return '/hero_resort.jpg';
};
