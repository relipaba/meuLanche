import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useIsAdmin(){
  const [isAdmin, setIsAdmin] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    ;(async()=>{
      try{
        const { data, error } = await supabase.auth.getUser()
        if(error) throw error
        const user = data?.user
        if(!user){ if(active){ setIsAdmin(false); setChecked(true) } return }
        const { data: perfil, error: perfilErr } = await supabase
          .from('perfil')
          .select('adm')
          .eq('id_user', user.id)
          .maybeSingle()
        if(perfilErr) throw perfilErr
        if(active){
          setIsAdmin(Boolean(perfil?.adm))
          setChecked(true)
        }
      }catch(err){
        if(active){
          console.warn('Falha ao checar permissões', err)
          setIsAdmin(false)
          setChecked(true)
        }
      }
    })()
    return () => { active = false }
  }, [])

  return { isAdmin, checked }
}
