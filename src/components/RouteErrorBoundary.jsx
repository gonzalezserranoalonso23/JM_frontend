import { Component } from 'react'
import { Button } from '@/components/ui/button'

const isChunkError = (error) =>
  /dynamically imported module|Importing a module script failed|Failed to fetch/i.test(
    error?.message || ''
  )

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    console.error(error)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  retry = () => {
    if (isChunkError(this.state.error)) {
      window.location.reload()
      return
    }
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        className="flex min-h-64 flex-col items-center justify-center gap-4 p-6 text-center"
      >
        <h1 className="text-lg font-semibold">
          No se pudo mostrar esta pantalla
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocurrió un error. Puedes reintentar sin cerrar la sesión.
        </p>
        <Button type="button" onClick={this.retry}>
          Reintentar
        </Button>
      </div>
    )
  }
}

export default RouteErrorBoundary
