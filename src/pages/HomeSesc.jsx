import { useNavigate } from 'react-router-dom'
import React, { useState, useMemo, useEffect } from 'react'
import ProductModal from '../components/ProductModal'
import { useCart } from '../context/CartContext.jsx'
import { fetchProducts } from '../lib/products'
import ProfileIcon from '../components/ProfileIcon'
import { useIsAdmin } from '../hooks/useIsAdmin'

// Produtos são carregados do Supabase
const LANCHONETE_SESC_ID = Number(import.meta.env.VITE_LANCHONETE_SESC_ID ?? 6)

export default function HomeSesc(){
  const { addItem } = useCart()
  const navigate = useNavigate()
  const { isAdmin } = useIsAdmin()
  const [filterOpen, setFilterOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadErr, setLoadErr] = useState('')

  useEffect(()=>{
    let mounted = true
    ;(async()=>{
      try{
        setLoadErr(''); setLoading(true)
        const data = await fetchProducts()
        if(mounted) {
          const tagged = data.map(p => ({ ...p, lanchoneteId: LANCHONETE_SESC_ID }))
          setProducts(tagged)
        }
      }catch(e){ if(mounted) { console.error(e); setLoadErr(e.message || 'Falha ao carregar produtos') } }
      finally{ if(mounted) setLoading(false) }
    })()
    return ()=>{ mounted = false }
  }, [])
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const filtered = useMemo(() => {
    if(!query) return products
    const q = norm(query)
    const categoryTokens = ['bebidas','bebida','salgados','salgado','doces','doce','vegetariano','vegetarianos','veg','veggie']
    if (categoryTokens.includes(q)) {
      return products.filter(p => Array.isArray(p.tags) && p.tags.some(tag => tag === q))
    }
    return products.filter(p => norm(p.name + ' ' + p.desc).includes(q))
  }, [query, products])
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="relative bg-gradient-to-b from-blueTop to-[#5f88db] pt-4 pb-8 border-b border-black/20 shadow">
        <div className="max-w-6xl mx-auto px-4 relative">
          <button aria-label="voltar" onClick={()=>navigate(-1)} className="absolute left-2 top-3 text-black/80">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button onClick={()=>navigate('/options')} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border text-xs md:text-sm font-semibold tracking-wide">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/></svg>
              LANCHONETES
            </button>
            <button onClick={()=>navigate('/cart')} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border text-xs md:text-sm font-semibold tracking-wide">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 4h2l3.6 7.59L7.25 14H19a1 1 0 0 0 0-2H9.42l.93-2H18a1 1 0 1 0 0-2H9L7.21 4H3z"/></svg>
              CARRINHO
            </button>
            <button onClick={()=>navigate('/perfil')} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border text-xs md:text-sm font-semibold tracking-wide">
              <ProfileIcon size={16} />
              PERFIL
            </button>
            {isAdmin && (
              <button onClick={()=>navigate('/admin')} className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow border text-xs md:text-sm font-semibold tracking-wide">
                <ProfileIcon size={16} />
                ADMINISTRAR
              </button>
            )}
          </div>
          <div className="absolute right-2 top-2 bg-white rounded-md px-3 py-1 shadow border">
            <img src="/assets/Sesc.png" alt="Sesc" className="h-8" />
          </div>
          <div className="mt-3 flex justify-center">
            <div className="px-6 py-1.5 bg-white rounded-full shadow border text-[13px] tracking-wide">CARDAPIO SESC</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 bg-transparent">
        <div className="max-w-5xl mx-auto px-3 md:px-4 mt-8 md:mt-10">
          <div className="flex items-center justify-between mb-3">
            <button onClick={()=>setFilterOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border shadow bg-white text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 4h18v2H3V4zm3 7h12v2H6v-2zm3 7h6v2H9v-2z"/></svg>
              FILTRAR
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 p-4 md:p-6">
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              {loading && <div className="col-span-full text-center text-sm text-gray-600">carregando...</div>}
              {loadErr && <div className="col-span-full text-center text-sm text-red-600">{loadErr}</div>}
              {filtered.length === 0 && (
                <div className="col-span-full text-center text-sm text-gray-600">Nenhum item encontrado.</div>
              )}
              {filtered.map((p)=> (
                <button key={p.id} onClick={()=>setSelected(p)} className="text-left flex items-center gap-4 md:gap-5 rounded-2xl border border-gray-200 bg-white shadow p-4 md:p-5 hover:translate-y-0.5 transition-transform">
                  <div className="w-28 h-24 md:w-32 md:h-24 rounded-md bg-gray-200 overflow-hidden flex-shrink-0">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base md:text-lg font-semibold text-gray-800">{p.name}</div>
                    <div className="text-sm md:text-base text-gray-600 text-clamp-3 min-h-[3.5rem]">{p.desc}</div>
                  </div>
                  <div className="text-sm md:text-base text-gray-700 font-semibold whitespace-nowrap">R$ {p.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {filterOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setFilterOpen(false)} />
          <div className="relative z-50 w-full max-w-md mx-4 rounded-xl shadow-2xl p-6 bg-blueBottom">
            <div className="flex justify-center -mt-8 mb-6">
              <div className="px-6 py-1.5 bg-white rounded-full shadow border text-[13px] tracking-wide">OPCOES</div>
            </div>
            <div className="space-y-4">
              <button onClick={()=>{setQuery('bebidas'); setFilterOpen(false)}} className="block w-64 mx-auto px-4 py-2.5 rounded-md bg-accent text-black font-semibold shadow border">Bebidas</button>
              <button onClick={()=>{setQuery('salgados'); setFilterOpen(false)}} className="block w-64 mx-auto px-4 py-2.5 rounded-md bg-accent text-black font-semibold shadow border">Salgados</button>
              <button onClick={()=>{setQuery('doces'); setFilterOpen(false)}} className="block w-64 mx-auto px-4 py-2.5 rounded-md bg-accent text-black font-semibold shadow border">Doces</button>
              <button onClick={()=>{setQuery('vegetariano'); setFilterOpen(false)}} className="block w-64 mx-auto px-4 py-2.5 rounded-md bg-accent text-black font-semibold shadow border">Vegetariano</button>
              <div className="text-center pt-2">
                <button onClick={()=>{setQuery(''); setFilterOpen(false)}} className="text-white/90 underline">limpar filtro</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          onClose={()=>setSelected(null)}
          onAdd={(prod, qty)=>{
            addItem(prod, qty)
          }}
        />
      )}

      {/* Footer (sem botão) */}
      <footer className="h-24 bg-gradient-to-t from-blueTop to-[#5f88db]" />
    </div>
  )
}


