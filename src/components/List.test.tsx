import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { ContactList } from './Label'

describe('App', () => {
  it('renders headline', () => {

    render(
      <ContactList
        service={{
          attach: (callback) => {
            callback([{ name: 'Lucas Badico' }])
          },
        }}
      />
    )

    screen.debug()

    const elementHTML = screen.getByText('Lucas Badico')

    expect(elementHTML).toBeTruthy()
    // check if App components renders headline
  })
})
