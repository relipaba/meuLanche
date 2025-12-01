import { Link, useNavigate } from 'react-router-dom'
import ProfileIcon from '../components/ProfileIcon'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Options(){
  const navigate = useNavigate()
  const { isAdmin } = useIsAdmin()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [school, setSchool] = useState(null)
  const [lanchonetes, setLanchonetes] = useState([])
  const [status, setStatus] = useState('loading') // loading | waiting | empty | ready

  useEffect(() => {
    let active = true
    async function loadData(){
      try{
        setLoading(true); setError(''); setStatus('loading')
        const { data: authData, error: authErr } = await supabase.auth.getUser()
        if(authErr) throw authErr
        const userId = authData?.user?.id
        if(!userId) throw new Error('Faça login para ver as lanchonetes.')

        const { data: perfil, error: perfilErr } = await supabase
          .from('perfil')
          .select('id_escola, escola:escola(nome_escola)')
          .eq('id_user', userId)
          .maybeSingle()
        if(perfilErr) throw perfilErr
        if(!perfil?.id_escola){
          if(active){
            setStatus('waiting')
            setSchool(null)
            setLanchonetes([])
          }
          return
        }
        if(active){
          setSchool(perfil.escola || null)
        }

        const { data: lanches, error: lanErr } = await supabase
          .from('lanchonete')
          .select('id_lanchonete,nome_lanchonete,id_escola')
          .eq('id_escola', perfil.id_escola)
          .order('nome_lanchonete', { ascending: true })
        if(lanErr) throw lanErr
        if(active){
          setLanchonetes(lanches || [])
          setStatus((lanches && lanches.length) ? 'ready' : 'empty')
        }
      }catch(err){
        console.error('Falha ao carregar lanchonetes', err)
        if(active){
          setError(err.message || 'Não foi possível carregar as lanchonetes.')
          setStatus('empty')
        }
      }finally{
        if(active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [])

  const lanchoneteCards = useMemo(() => {
    return (lanchonetes || []).map((lan) => {
      const name = (lan.nome_lanchonete || '').toLowerCase()
      let path = null
      let asset = null
      if(name.includes('sesc')){ path = '/sesc'; asset = '/assets/Sesc.png' }
      else if(name.includes('senac')){ path = '/senac'; asset = '/assets/Senac.png' }
      return { ...lan, path, asset }
    })
  }, [lanchonetes])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blueTop/80 via-blue-50/60 to-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="relative bg-gradient-to-b from-blueTop to-[#5f88db] pt-5 pb-20 md:pt-7 md:pb-28 border-b border-black/20 shadow">
        <div className="max-w-7xl mx-auto px-6 relative">
          <button aria-label="voltar" onClick={()=>navigate(-1)} className="absolute left-4 top-5 text-black/80">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          <div className="flex items-center justify-center gap-5 mt-10 md:mt-14 flex-wrap">
            <button onClick={()=>navigate('/options')} className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white rounded-full shadow border text-sm md:text-base font-semibold tracking-wide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h12v2H3v-2z"/></svg>
              LANCHONETES
            </button>
            <button onClick={()=>navigate('/cart')} className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white rounded-full shadow border text-sm md:text-base font-semibold tracking-wide">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM3 4h2l3.6 7.59L7.25 14H19a1 1 0 0 0 0-2H9.42l.93-2H18a1 1 0 1 0 0-2H9L7.21 4H3z"/></svg>
              CARRINHO
            </button>
            <button onClick={()=>navigate('/perfil')} className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white rounded-full shadow border text-sm md:text-base font-semibold tracking-wide">
              <ProfileIcon size={20} />
              PERFIL
            </button>
            {isAdmin && (
              <button onClick={()=>navigate('/admin')} className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-white rounded-full shadow border text-sm md:text-base font-semibold tracking-wide">
                <ProfileIcon size={20} />
                ADMINISTRAR
              </button>
            )}
          </div>

          <div className="absolute right-4 md:right-6 top-3 md:top-4 bg-white rounded-md px-4 py-2 shadow border">
            <img src="/assets/SescSenac.png" alt="Sesc Senac" className="h-10 md:h-12" />
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 -bottom-5">
          <div className="px-10 py-3 bg-white rounded-full shadow border text-lg md:text-xl font-semibold tracking-wide">LANCHONETES</div>
        </div>
      </header>

      <main className="flex-1 bg-transparent pt-28 md:pt-36 pb-18 md:pb-20">
        <div className="max-w-6xl mx-auto px-8">
          {status === 'loading' && (
            <div className="text-center text-gray-600">Carregando lanchonetes...</div>
          )}
          {status === 'waiting' && (
            <div className="text-center text-gray-700 bg-white/80 backdrop-blur rounded-2xl shadow-panel p-6 border border-white/50">
              Espere até ser atribuído a uma escola para ver as lanchonetes.
            </div>
          )}
          {status === 'empty' && !loading && !error && (
            <div className="text-center text-gray-700 bg-white/80 backdrop-blur rounded-2xl shadow-panel p-6 border border-white/50">
              Nenhuma lanchonete disponível para sua escola no momento.
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 bg-white/80 backdrop-blur rounded-2xl shadow-panel p-6 border border-white/50">
              {error}
            </div>
          )}
          {status === 'ready' && (
            <div className="grid sm:grid-cols-2 gap-10 justify-items-center">
              {lanchoneteCards.map((lan) => (
                lan.path ? (
                  <Link key={lan.id_lanchonete} to={lan.path} className="bg-white/90 backdrop-blur rounded-2xl shadow-panel p-4 hover:shadow-lg transition w-[340px] md:w-[420px] border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{school?.nome_escola || 'Escola'}</span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">Lanchonete</span>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 mb-3">{lan.nome_lanchonete}</div>
                    <div className="h-56 md:h-60 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed overflow-hidden">
                      {lan.asset ? (
                        <img src={lan.asset} alt={lan.nome_lanchonete} className="h-full object-contain" />
                      ) : (
                        <span className="text-gray-400 text-sm">Acessar {lan.nome_lanchonete}</span>
                      )}
                    </div>
                  </Link>
                ) : (
                  <div key={lan.id_lanchonete} className="bg-white/90 backdrop-blur rounded-2xl shadow-panel p-4 w-[340px] md:w-[420px] border border-white/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">{school?.nome_escola || 'Escola'}</span>
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold border border-gray-200">Sem rota</span>
                    </div>
                    <div className="text-xl font-semibold text-gray-800 mb-3">{lan.nome_lanchonete}</div>
                    <div className="h-56 md:h-60 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed text-gray-500 text-sm overflow-hidden">
                      {lan.asset ? (
                        <img src={lan.asset} alt={lan.nome_lanchonete} className="h-full object-contain" />
                      ) : (
                        'Rota não configurada para esta lanchonete.'
                      )}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="h-28 md:h-32 bg-gradient-to-t from-blueTop to-[#5f88db]" />
    </div>
  )
}
