export const seasonalOffer = {
  isActive: true,
  title: 'Monsoon Bloom Sale',
  description: 'Celebrate the season with 15% off all hand-crafted bouquets',
  discount: 15,
  endDate: new Date('2026-06-30T23:59:59'),
  ctaText: 'Shop the Sale',
  ctaLink: '/shop',
}

export const promoCodes = {
  BLOOM15: { discount: 15, type: 'percent' },
  BLISS500: { discount: 500, type: 'fixed' },
  WELCOME10: { discount: 10, type: 'percent' },
}
