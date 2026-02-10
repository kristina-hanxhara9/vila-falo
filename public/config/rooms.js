/**
 * Centralized Room Configuration
 * This file contains all room types, pricing, and amenities
 * Update this single file to manage all room information across the site
 */

window.roomConfig = {
  // Room types organized by key
  Standard: {
    type: 'Standard',
    name: 'Standard Mountain Room',
    albanianName: 'Dhomë Standart Malore',
    capacity: 2,
    minGuests: 1,
    maxGuests: 2,
    pricePerNight: 5000,
    description: 'Cozy mountain room with stunning views',
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'TV'],
    icon: '🏔️'
  },

  Deluxe: {
    type: 'Deluxe',
    name: 'Deluxe Family Suite',
    albanianName: 'Suitë Familjare Deluxe',
    capacity: 4,
    minGuests: 1,
    maxGuests: 4,
    pricePerNight: 6000,
    description: 'Spacious family suite perfect for groups',
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Kitchenette', 'Living Area'],
    icon: '👨‍👩‍👧‍👦'
  },

  Premium: {
    type: 'Premium',
    name: 'Premium Panorama Suite',
    albanianName: 'Suitë Premium Panoramike',
    capacity: 5,
    minGuests: 1,
    maxGuests: 5,
    pricePerNight: 7000,
    description: 'Premium suite with panoramic mountain views',
    amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'TV', 'Jacuzzi', 'Terrace', 'Premium Minibar'],
    icon: '👑'
  }
};

/**
 * Get all room types
 */
window.getRoomTypes = function() {
  return Object.keys(window.roomConfig).map(key => ({
    value: key,
    label: window.roomConfig[key].name,
    price: window.roomConfig[key].pricePerNight,
    capacity: window.roomConfig[key].capacity
  }));
};

/**
 * Get room config by type
 */
window.getRoomConfig = function(roomType) {
  return window.roomConfig[roomType] || null;
};

/**
 * Get room price per night
 */
window.getRoomPrice = function(roomType) {
  const room = window.roomConfig[roomType];
  return room ? room.pricePerNight : 0;
};

/**
 * Get room capacity
 */
window.getRoomCapacity = function(roomType) {
  const room = window.roomConfig[roomType];
  return room ? room.maxGuests : 0;
};

/**
 * Format room option for display
 */
window.formatRoomOption = function(roomType) {
  const room = window.roomConfig[roomType];
  if (!room) return '';
  return `${room.icon} ${room.name} - ${room.pricePerNight.toLocaleString()} ALL/night (Max ${room.capacity} guests)`;
};

console.log('✅ Room configuration loaded');
