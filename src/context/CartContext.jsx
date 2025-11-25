import { createContext, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }){
  const [items, setItems] = useState([])

  const addItem = (product, qty = 1) => {
    const name = product?.name ?? 'Produto'
    const priceLabel = normalizePriceLabel(product?.price)
    const price = parsePrice(priceLabel)
    const id = product?.id ?? `${name}-${price}`
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      if (idx >= 0) { const cp = prev.slice(); cp[idx] = { ...cp[idx], qty: cp[idx].qty + qty }; return cp }
      return [...prev, { id, name, image: product?.image, priceLabel, price, qty, lanchoneteId: product?.lanchoneteId }]
    })
  }
  const removeItem = (id) => setItems(prev => prev.filter(it => it.id !== id))
  const clearCart = () => setItems([])
  const total = useMemo(() => items.reduce((s, it) => s + it.price * it.qty, 0), [items])
  const value = useMemo(() => ({ items, addItem, removeItem, clearCart, total }), [items, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export function useCart(){ const c = useContext(CartContext); if(!c) throw new Error('useCart'); return c }
export function parsePrice(label){ if(typeof label==='number')return label; if(!label) return 0; const n=Number(String(label).replace(/[^0-9,.-]/g,'').replace(/\./g,'').replace(/,/,'.')); return Number.isFinite(n)?n:0 }
export function formatBRL(n){ try{return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}catch{return `R$ ${n.toFixed(2)}`.replace('.',',')}}
function normalizePriceLabel(price){ if(typeof price==='number') return formatBRL(price); if(!price) return 'R$ 0,00'; return String(price) }
