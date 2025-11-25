export function formatPrice(value){
  if (value == null) return 'R$ 0,00'
  const num = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(num)) return `R$ ${value}`
  return `R$ ${num.toFixed(2).replace('.', ',')}`
}

export function belongsToCategory(cat, key){
  const c = (cat||'').toLowerCase()
  if(!key) return true
  return c.includes(key)
}
