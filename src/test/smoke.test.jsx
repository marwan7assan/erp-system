import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('test setup', () => {
  it('renders a React element', () => {
    render(<button>Login</button>)
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
  })
})