import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileIcon({ size = 20, className = '' }){
  const [foto, setFoto] = useState(null)

  useEffect(() => {
    let active = true
    async function loadFoto(){
      try{
        const { data, error } = await supabase.auth.getUser()
        if(error) throw error
        const user = data?.user
        if(!user || !active) return
        const { data: perfil, error: perfilErr } = await supabase
          .from('perfil')
          .select('foto')
          .eq('id_user', user.id)
          .maybeSingle()
        if(perfilErr) throw perfilErr
        if(active) setFoto(perfil?.foto || null)
      }catch{
        if(active) setFoto(null)
      }
    }
    loadFoto()
    return () => { active = false }
  }, [])

  if(foto){
    return (
      <img
        src={foto}
        alt="Foto do perfil"
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M6 20a6 6 0 0 1 12 0" />
    </svg>
  )
}
