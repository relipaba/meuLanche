export default function Wave({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        {/* Base gradient (azul escuro, como a imagem) */}
        <linearGradient id="waveFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#385FB7" />
          <stop offset="100%" stopColor="#2B3F8F" />
        </linearGradient>
        {/* Faixa ciano da borda (vai de claro a ciano intenso) */}
        <linearGradient id="rimGrad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6FEAFF" />
          <stop offset="100%" stopColor="#1DC6EE" />
        </linearGradient>
        {/* Realce fino ainda mais claro na crista */}
        <linearGradient id="crestLight" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#9FF3FF" />
          <stop offset="100%" stopColor="#58E2FF" />
        </linearGradient>
      </defs>

      {/* Formato da onda: curva suave à esquerda e crista alta à direita */}
      <path
        d="M0,230 C320,265 860,215 1120,210 C1280,206 1385,150 1440,60 L1440,320 L0,320 Z"
        fill="url(#waveFill)"
      />

      {/* Faixa ciano — mais fina à esquerda, mais grossa à direita */}
      <path
        d="M0,210 C320,250 860,210 1120,204 C1290,200 1395,130 1440,40 L1440,72 C1394,150 1295,205 1120,214 C860,224 320,245 0,198 Z"
        fill="url(#rimGrad)"
        opacity="0.95"
      />

      {/* Linha de brilho no bordo superior (bem clara) */}
      <path
        d="M0,210 C320,250 860,210 1120,204 C1290,200 1395,130 1440,40"
        fill="none"
        stroke="url(#crestLight)"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}
