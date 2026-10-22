import type { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
}

export function Button({ children, onClick, variant = 'primary', type = 'button' }: ButtonProps) {
  return <button type={type} onClick={onClick} className={`button ${variant}`}>{children}</button>
}
