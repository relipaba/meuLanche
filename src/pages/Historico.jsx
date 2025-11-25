import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Wave from '../components/Wave'
import { formatBRL } from '../context/CartContext.jsx'
import { supabase } from '../lib/supabase'

function formatDate(iso){
  try{
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2,'0')
    const mm = String(d.getMonth()+1).padStart(2,'0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }catch{return iso}
}

export default function Historico(){
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(()=>{
    let active = true
    async function fetchHistory(){
      try{
        setErro('')
        setLoading(true)
        const { data: auth, error: authErr } = await supabase.auth.getUser()
        if(authErr) throw authErr
        const user = auth?.user
        if(!user){ setErro('Faça login para ver seu histórico.'); setRecords([]); return }

        const { data: pedidos, error: pedidosErr } = await supabase
          .from('pedido')
          .select('id_pedido, created_at')
          .eq('id_user_cliente', user.id)
          .order('created_at', { ascending: false })
        if(pedidosErr) throw pedidosErr
        if(!pedidos?.length){ setRecords([]); return }

        const pedidoIds = pedidos.map(p => p.id_pedido)
        const { data: itens, error: itensErr } = await supabase
          .from('itens_pedido')
          .select('id_pedido, id_produto, quantidade, preco_unitario')
          .in('id_pedido', pedidoIds)
        if(itensErr) throw itensErr
        if(!itens?.length){ setRecords([]); return }

        const produtoIds = Array.from(new Set(itens.map(it => it.id_produto).filter(Boolean)))
        let produtosMap = new Map()
        if(produtoIds.length){
          const { data: produtos, error: produtosErr } = await supabase
            .from('produto')
            .select('id_produto, nome_produto, img')
            .in('id_produto', produtoIds)
          if(produtosErr) throw produtosErr
          produtos?.forEach(prod => produtosMap.set(prod.id_produto, prod))
        }

        const entries = itens.map(it => {
          const pedido = pedidos.find(p => p.id_pedido === it.id_pedido)
          const produto = produtosMap.get(it.id_produto)
          return {
            id: `${it.id_pedido}-${it.id_produto}-${Math.random()}`,
            qty: it.quantidade,
            price: it.preco_unitario,
            name: produto?.nome_produto || `Produto ${it.id_produto}`,
            image: produto?.img || null,
            date: pedido?.created_at || null
          }
        })
        if(active) setRecords(entries)
      }catch(err){
        console.error('Falha ao carregar histórico', err)
        if(active) setErro(err.message || 'Falha ao carregar histórico')
      }finally{
        if(active) setLoading(false)
      }
    }
    fetchHistory()
    return () => { active = false }
  }, [])

  const orderedRecords = useMemo(() => records.slice().sort((a,b) => {
    const da = a.date ? new Date(a.date).getTime() : 0
    const db = b.date ? new Date(b.date).getTime() : 0
    return db - da
  }), [records])
  const groupedRecords = useMemo(() => {
    const groups = orderedRecords.reduce((acc, rec) => {
      const key = formatDate(rec.date || '')
      if(!acc[key]) acc[key] = []
      acc[key].push(rec)
      return acc
    }, {})
    return Object.entries(groups)
  }, [orderedRecords])

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      <Wave className="absolute inset-x-0 bottom-0 w-full h-64 md:h-80 lg:h-96 pointer-events-none select-none" />

      {/* Header */}
      <header className="relative bg-gradient-to-b from-blueTop to-[#5f88db] pt-8 pb-20 md:pt-10 md:pb-28 border-b border-black/20 shadow">
        <div className="max-w-6xl mx-auto px-4 relative">
          <button aria-label="voltar" onClick={()=>navigate(-1)} className="absolute left-2 top-3 text-black/80">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="absolute right-2 top-2 bg-white rounded-md px-3 py-1 shadow border">
            <img src="/assets/Senac.png" alt="Logo" className="h-8" />
          </div>
          <div className="flex justify-center">
            <div className="px-6 py-1.5 bg-white rounded-full shadow border text-[13px] tracking-wide">HISTORICO DE COMPRAS</div>
          </div>
        </div>
      </header>

      {/* List */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-40">
        <section className="bg-white rounded-3xl shadow-2xl ring-1 ring-black/5 px-6 sm:px-10 py-8">
          {loading && <div className="text-center text-gray-600 py-10">Carregando...</div>}
          {erro && !loading && <div className="text-center text-red-600 py-10">{erro}</div>}
          {!loading && !erro && orderedRecords.length === 0 && (
            <div className="text-center text-gray-600 py-10">Você ainda não possui compras registradas.</div>
          )}
          {!loading && !erro && groupedRecords.map(([date, items]) => (
            <div key={date} className="mb-8 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-blueTop" />
                <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">{date}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blueTop/40 to-transparent" />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {items.map((p, idx) => (
                    <div key={`${p.id}-${idx}`} className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white shadow-md p-4 md:p-5 hover:translate-y-0.5 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blueTop/10 text-blueTop font-semibold flex items-center justify-center text-sm">
                        {p.qty}
                      </div>
                      <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">sem foto</div>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-semibold text-gray-900 capitalize">{p.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Pedido #{p.id.split('-')[0]}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{formatBRL(p.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
