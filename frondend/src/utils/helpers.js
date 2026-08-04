export const formatPrice = (amount) => {
  return `LKR ${amount.toLocaleString('en-LK')}`
}

export const generateOrderId = () => {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `ORD-${num}`
}

export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 2) return { level: 33, label: 'Weak', color: '#C2185B' }
  if (score <= 3) return { level: 66, label: 'Fair', color: '#C9A84C' }
  return { level: 100, label: 'Strong', color: '#7A9E7E' }
}

export const isNewProduct = (createdAt) => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(createdAt) > sevenDaysAgo
}

export const getMinDeliveryDate = (waitingDays = 0) => {
  const date = new Date()
  date.setDate(date.getDate() + waitingDays + 1)
  return date.toISOString().split('T')[0]
}

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const validatePhone = (phone) => /^(\+94|0)?[0-9]{9,10}$/.test(phone.replace(/\s/g, ''))

export const getGradientForProduct = (id) => {
  const gradients = [
    'linear-gradient(135deg, #F2A7BB 0%, #FFD6E0 50%, #F9EDD3 100%)',
    'linear-gradient(135deg, #FFD6E0 0%, #F2A7BB 40%, #C2185B 100%)',
    'linear-gradient(160deg, #F9EDD3 0%, #FFD6E0 60%, #7A9E7E 100%)',
    'linear-gradient(145deg, #C2185B 0%, #F2A7BB 50%, #FFD6E0 100%)',
    'linear-gradient(120deg, #7A9E7E 0%, #F9EDD3 50%, #F2A7BB 100%)',
    'linear-gradient(170deg, #FFD6E0 0%, #C9A84C 40%, #F2A7BB 100%)',
  ]
  const index = typeof id === 'string'
    ? id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % gradients.length
    : id % gradients.length
  return gradients[index]
}
