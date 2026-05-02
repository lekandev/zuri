export default function MacWindow({ children, className = '', style = {} }) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm transition-shadow hover:shadow-md ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
