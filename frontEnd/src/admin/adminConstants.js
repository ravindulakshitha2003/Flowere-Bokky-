export const OCCASIONS = ['Birthday', 'Wedding', 'Anniversary', 'Graduation', "Valentine's", 'Just Because']

export const COLOR_OPTIONS = ['Red', 'Pink', 'White', 'Yellow', 'Purple', 'Orange', 'Mixed']

export const COLOR_MAP = {
  Red: '#C2185B', Pink: '#F2A7BB', White: '#FFFDF8', Yellow: '#F9EDD3',
  Purple: '#9C27B0', Orange: '#FF9800', Mixed: 'linear-gradient(135deg, #F2A7BB, #7A9E7E)',
}

export const ADMIN_ADDONS = [
  { id: 'led-lighting', name: 'LED Lighting', price: 350 },
  { id: 'fairy-lights-admin', name: 'Fairy Lights', price: 500 },
  { id: 'butterfly-deco', name: 'Butterfly Decoration', price: 200 },
  { id: 'ribbon-upgrade', name: 'Ribbon Upgrade', price: 150 },
  { id: 'birthday-tag-admin', name: 'Birthday Tag', price: 100 },
  { id: 'greeting-card-admin', name: 'Greeting Card', price: 200 },
  { id: 'balloon-admin', name: 'Balloon', price: 350 },
]

export const DEFAULT_WRAPPING_PAPERS = [
  { id: 'wr-1', name: 'Blush Pink', hex: '#F2A7BB', price: 0 },
  { id: 'wr-2', name: 'Ivory Silk', hex: '#FFFDF8', price: 0 },
  { id: 'wr-3', name: 'Sage Green', hex: '#7A9E7E', price: 0 },
  { id: 'wr-4', name: 'Gold Foil', hex: '#C9A84C', price: 150 },
  { id: 'wr-5', name: 'Kraft Natural', hex: '#D4A574', price: 0 },
  { id: 'wr-6', name: 'Rustic Kraft', hex: '#C4A882', price: 100 },
]

export const DEFAULT_DELIVERY_ZONES = [
  { id: 'z-1', name: 'Zone 1', minKm: 0, maxKm: 5, price: 150, active: true },
  { id: 'z-2', name: 'Zone 2', minKm: 5, maxKm: 15, price: 300, active: true },
  { id: 'z-3', name: 'Zone 3', minKm: 15, maxKm: 30, price: 500, active: true },
  { id: 'z-4', name: 'Zone 4', minKm: 30, maxKm: 999, price: 800, active: true },
]

export const DEFAULT_DELIVERY_SLOTS = [
  { id: 'morning', label: 'Morning', time: '08:00 AM – 12:00 PM', icon: '🌅', active: true, maxOrders: 20 },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM – 04:00 PM', icon: '☀️', active: true, maxOrders: 25 },
  { id: 'evening', label: 'Evening', time: '04:00 PM – 08:00 PM', icon: '🌆', active: true, maxOrders: 20 },
]

export const DEFAULT_DELIVERY_RULES = {
  sameDayDelivery: true,
  freeDeliveryThreshold: 5000,
  blockSundays: true,
  advanceBookingDays: 1,
}

export const MOCK_CUSTOMER_PHOTOS = [
  { id: 'sub-1', title: 'Anniversary Roses', author: 'Amaya Fernando', gradient: 'linear-gradient(135deg, #F2A7BB, #FFD6E0)', status: 'pending' },
  { id: 'sub-2', title: 'Birthday Sunflowers', author: 'Dilshan Perera', gradient: 'linear-gradient(135deg, #F9EDD3, #C9A84C)', status: 'pending' },
]
