import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  disabled?: boolean
}

export function Button({ children, onClick, variant = 'primary', type = 'button', disabled = false }: ButtonProps) {
  return <button type={type} onClick={onClick} disabled={disabled} className={`button ${variant}`}>{children}</button>
}
