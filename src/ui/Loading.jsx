const Loading = ({ fullScreen = true }) => {
  return (
    <div
      className={`flex justify-center items-center ${fullScreen ? 'min-h-screen' : 'py-6'}`}
      role="status"
      aria-label="Cargando"
    >
      <div className="animate-spin">
        <svg
          className="w-12 h-12 text-warning"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            opacity="0.3"
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  )
}

export default Loading
