import { trace } from '@opentelemetry/api'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// IMPORTANTE: Importa la inicialización de OTEL antes de usar el tracer.
// Si tu middleware corre en Node.js, esto funcionará.
// Si corres en Edge (Vercel Edge Functions), OTEL aún no es soportado completamente.
import '../instrumentation'

export function middleware(request: NextRequest) {
  const tracer = trace.getTracer('nextjs-middleware')
  // Puedes agregar contexto y atributos útiles:
  const span = tracer.startSpan('middleware-span', {
    attributes: {
      'http.url': request.url,
      'http.method': request.method,
      'user-agent': request.headers.get('user-agent') || '',
    },
  })

  const response = NextResponse.next()

  span.end()
  return response
}

export const config = {
  // Excluir rutas de API, archivos estáticos y rutas internas de Next.js
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
