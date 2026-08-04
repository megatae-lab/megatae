const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined

let gtmLoaded = false
let gaLoaded = false
let interactionTrackingLoaded = false
let currentPath = ''
let scrollThresholdsTracked = new Set<number>()

const SCROLL_THRESHOLDS = [25, 50, 75, 90]

declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}

interface AppendScriptOptions {
  id: string
  src: string
  async?: boolean
}

function appendScript({ id, src, async = true }: AppendScriptOptions) {
  if (document.getElementById(id)) return

  const script = document.createElement('script')
  script.id = id
  script.async = async
  script.src = src
  document.head.appendChild(script)
}

function getPageType(path: string): string {
  if (path === '/') return 'home'
  if (path === '/conocenos') return 'conocenos'
  if (path === '/registro') return 'registro'
  if (path === '/comprar') return 'comprar'
  if (path === '/pago') return 'pago'
  if (path === '/gracias') return 'gracias_conversion'
  if (path.startsWith('/v1/eSIM-Movistar/comprar')) return 'comprar_movistar'
  if (path.startsWith('/v1/eSIM-Movistar')) return 'landing_movistar'
  if (path.startsWith('/v1/eSIM-Bait/comprar')) return 'comprar_bait'
  if (path.startsWith('/v1/eSIM-Bait')) return 'landing_bait'
  if (path.startsWith('/v1/eSIM-Att/comprar')) return 'comprar_att'
  if (path.startsWith('/v1/eSIM-Att')) return 'landing_att'
  if (path.startsWith('/admin')) return 'admin'
  return 'otro'
}

function getElementLabel(element: HTMLElement): string {
  return (
    element.getAttribute('data-analytics-label') ||
    element.getAttribute('aria-label') ||
    element.getAttribute('title') ||
    element.innerText ||
    element.textContent ||
    (element as HTMLAnchorElement).href ||
    'sin_etiqueta'
  ).trim().replace(/\s+/g, ' ').slice(0, 120)
}

function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return

  const payload = {
    event: eventName,
    page_path: currentPath || `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
    page_title: document.title,
    page_type: getPageType(window.location.pathname),
    ...params,
  }

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push(payload)

  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    const { event, ...gtagParams } = payload
    window.gtag('event', event, gtagParams)
  }
}

function handleDocumentClick(event: MouseEvent) {
  // No trackear clics en el panel admin
  if (window.location.pathname.startsWith('/admin')) return

  const target = (event.target as HTMLElement)?.closest?.('a, button, [role="button"]') as HTMLElement | null
  if (!target) return

  const isLink = target.tagName?.toLowerCase() === 'a'
  trackEvent(isLink ? 'link_click' : 'button_click', {
    click_text: getElementLabel(target),
    click_url: isLink ? (target as HTMLAnchorElement).href : undefined,
  })
}

function handleScrollDepth() {
  const doc = document.documentElement
  const scrollableHeight = doc.scrollHeight - window.innerHeight
  if (scrollableHeight <= 0) return

  const percent = Math.min(100, Math.round((window.scrollY / scrollableHeight) * 100))
  const threshold = SCROLL_THRESHOLDS.find((value) => percent >= value && !scrollThresholdsTracked.has(value))

  if (!threshold) return
  scrollThresholdsTracked.add(threshold)
  trackEvent('scroll_depth', {
    scroll_percent: threshold,
  })
}

function initInteractionTracking() {
  if (interactionTrackingLoaded) return

  document.addEventListener('click', handleDocumentClick, true)
  window.addEventListener('scroll', handleScrollDepth, { passive: true })
  interactionTrackingLoaded = true
}

export function initAnalytics() {
  if (typeof window === 'undefined') return

  window.dataLayer = window.dataLayer || []
  initInteractionTracking()

  if (GTM_ID && !gtmLoaded) {
    window.dataLayer.push({
      'gtm.start': Date.now(),
      event: 'gtm.js',
    })
    appendScript({
      id: 'google-tag-manager',
      src: `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`,
    })
    gtmLoaded = true
  }

  if (GA_MEASUREMENT_ID && !gaLoaded) {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
    appendScript({
      id: 'google-analytics',
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
    })
    gaLoaded = true
  }
}

export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return
  // No trackear el panel admin
  if (window.location.pathname.startsWith('/admin')) return

  const pagePath = path || `${window.location.pathname}${window.location.search}`
  const pageLocation = window.location.href
  const pageTitle = document.title
  currentPath = pagePath
  scrollThresholdsTracked = new Set()

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event: 'page_view',
    page_path: pagePath,
    page_location: pageLocation,
    page_title: pageTitle,
    page_type: getPageType(window.location.pathname),
  })

  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_location: pageLocation,
      page_title: pageTitle,
      page_type: getPageType(window.location.pathname),
    })
  }
}