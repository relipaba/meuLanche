import React, { useState } from 'react'

export default function ProductModal({ product, onClose, onAdd }){
  const [qty, setQty] = useState(1)
  if (!product) return null

  const add = () => {
    const q = Math.max(1, qty || 1)
    onAdd?.(product, q)
    onClose?.()
  }

  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Image banner */}
        <div className="w-full bg-gray-200 flex-shrink-0">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-60 md:h-72 object-cover" />
          ) : (
            <div className="w-full h-60 md:h-72 flex items-center justify-center text-gray-500">
              imagem do produto
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6 space-y-4 overflow-y-auto">
          <div>
            <div className="text-lg md:text-xl font-bold text-gray-900">{product.name || 'Produto'}</div>
            <div className="text-blueTop font-semibold">{price}</div>
          </div>
          <p
            className="text-sm md:text-base text-gray-700 leading-relaxed"
            style={{ whiteSpace:'normal', wordBreak:'break-word' }}>
            {product.desc || 'Sem descricao.'}
          </p>

          {/* Quantity */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-sm font-semibold text-gray-800">Quantidade</span>
            <div className="inline-flex items-center border rounded-md overflow-hidden">
              <button onClick={()=>setQty(q=>Math.max(1, (Number(q)||1)-1))} className="px-3 py-1.5 select-none">-</button>
              <input
                className="w-12 text-center outline-none py-1.5"
                value={qty}
                onChange={(e)=>setQty(Number(e.target.value)||1)}
              />
              <button onClick={()=>setQty(q=>(Number(q)||1)+1)} className="px-3 py-1.5 select-none">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-md border shadow bg-white">Cancelar</button>
            <button onClick={add} className="px-6 py-2 rounded-md bg-accent text-black font-semibold border border-amber-700/40 shadow">
              Adicionar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
