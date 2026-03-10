interface SearchBarProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  testId?: string
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', testId = 'search-bar' }: SearchBarProps) {
  return (
    <div data-testid={testId} className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
      <input
        data-testid={`${testId}-input`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input pl-10"
      />
    </div>
  )
}
