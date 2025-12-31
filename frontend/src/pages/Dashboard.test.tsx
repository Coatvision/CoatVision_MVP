import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard.jsx'

// With missing Supabase envs, the Dashboard should show an error message.
describe('Dashboard', () => {
  it('renders Supabase configuration error when keys are missing', async () => {
    render(<Dashboard />)
    // Wait for effect to set error and stop loading
    const errorEl = await screen.findByText(/Supabase not configured/i)
    expect(errorEl).toBeDefined()
  })
})
