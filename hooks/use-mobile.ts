import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isClient, setIsClient] = React.useState<boolean>(false)

  React.useEffect(() => {
    setIsClient(true)
    
    // Função para verificar se é mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Verificar inicialmente
    checkIsMobile()

    // Adicionar listener para mudanças de tamanho
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkIsMobile()
    }
    
    mql.addEventListener("change", onChange)
    
    // Cleanup
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Retornar false durante SSR para evitar problemas de hidratação
  return isClient ? isMobile : false
}
