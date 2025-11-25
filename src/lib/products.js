import { supabase } from './supabase'

// Busca produtos do Supabase usando a tabela real `produto` e mapeia
export async function fetchProducts() {
  // 1) Tenta a tabela oficial
  const { data, error } = await supabase
    .from('produto')
    .select('*')
    .order('created_at', { ascending: false })
  if (!error && data) return data.map(normalizeProduct)

  // 2) Fallbacks (caso o nome esteja diferente no ambiente)
  const tableCandidates = ['produtos', 'products', 'itens', 'items']
  for (const table of tableCandidates) {
    const { data: d2, error: e2 } = await supabase.from(table).select('*')
    if (!e2 && d2) return d2.map(normalizeProduct)
  }
  throw error || new Error('Tabela de produtos não encontrada')
}

function normalizeProduct(r) {
  // Campos reais no seu schema:
  // id, nome_produto, descricao, preco, categoria, img, created_at
  const name = r.nome_produto ?? r.name ?? r.nome ?? 'Produto'
  const desc = r.descricao ?? r.desc ?? ''
  const priceRaw = r.preco ?? r.price ?? 0
  const image = r.img ?? r.image ?? null
  const categoria = r.categoria ?? r.category ?? null
  const tags = buildTags(categoria)
  const id = r.id ?? r.id_produto ?? `${name}-${priceRaw}`
  const price = typeof priceRaw === 'number'
    ? priceRaw
    : parseFloat(String(priceRaw).replace(/[^0-9,.-]/g, '').replace(/\./g, '').replace(/,/, '.')) || 0
  return { id, name, desc, price, image, tags, lanchoneteId: r.lanchonete_id ?? null, _raw: r }
}

const CATEGORY_SYNONYMS = {
  bebida: ['bebidas', 'drink', 'drinks'],
  salgado: ['salgados'],
  doce: ['doces', 'sobremesa', 'sobremesas'],
  vegetariano: ['vegetariano', 'vegetarianos', 'veg', 'veggie'],
}

function buildTags(categoria){
  if(!categoria) return null
  const normalized = String(categoria).trim().toLowerCase()
  if(!normalized) return null
  const variants = new Set([normalized])
  const extras = CATEGORY_SYNONYMS[normalized]
  if(Array.isArray(extras)) extras.forEach(v => variants.add(v))
  // garante que tanto singular quanto plural estejam presentes
  if(normalized.endsWith('s')) variants.add(normalized.replace(/s$/, ''))
  else variants.add(`${normalized}s`)
  return Array.from(variants)
}
