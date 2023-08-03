import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { makeContactService } from '../services/contacts'

import { ContactList } from './Label'
import { IContact, INetworkInfo } from '../services/contacts/types'

const makeStubLocalDataSource = (initalData?: IContact[]) => {
  const source = {
    contacts: initalData ?? ([] as IContact[]),
  }

  return {
    read() {
      return source.contacts
    },
    save(_contactsList: IContact[]) {
      source.contacts = _contactsList
    },
  }
}

const remoteContactList = [
  { name: 'Well', id: '1' },
  { name: 'Tom', id: '2' },
  { name: 'Raquel', id: '3' },
  { name: 'Fabio', id: '4' },
]

const makeStubRemoteDataSource = (error?: boolean) => {
  return {
    create: async function (newContact: { id: string; name: string }) {
      if (error) {
        throw new Error('somethingWentWrong')
      }
      return newContact
    },
    update: async function () {
      return remoteContactList[0]
    },
    list: async function () {
      return remoteContactList
    },
  }
}

const makeStubNetworkInfo = (isConnected = true): INetworkInfo => {
  return {
    isConnected: function () {
      return isConnected
    },
  }
}

const renderComponent = () => {
  const s = makeContactService(
    makeStubLocalDataSource(),
    makeStubRemoteDataSource(),
    makeStubNetworkInfo()
  )
  return render(<ContactList service={s} />)
}

describe('App', () => {
  it('on mount, render a loading without contact list', async () => {
    renderComponent()

    expect(screen.getByText(/Carregando/)).toBeInTheDocument()
    expect(screen.queryByText(/Pesquisa/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Well/)).not.toBeInTheDocument()
  })
  it('After loading, dont render loading', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.queryByText(/Carregando/)).not.toBeInTheDocument()
    })
  })
  it('After loading, render contact list', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Pesquisa/)).toBeInTheDocument()
      expect(screen.getByText(/Well/)).toBeInTheDocument()
    })
  })
  // it('On click remove button, open confirm modal', async () => {})
  // it('On click confirm, remove item', async () => {})
  // it('On click add/edit, send to another page', async () => {})
  it('Should render a message "not found" when search without results', async () => {
    renderComponent()

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Lucas' },
      })
      const tag = screen.queryByRole('heading', { name: 'Lucas' })
      const notFoundMessageTag = screen.getByText('Nenhum resultado para "Lucas"')
      expect(tag).not.toBeInTheDocument()
      expect(notFoundMessageTag).toBeInTheDocument()
    })
  })

  it('renders a contact', async () => {
    renderComponent()

    expect(await screen.findByText('Well')).toBeInTheDocument()
  })
  it('filter out contacts that do not match input text', async () => {
    renderComponent()

    await screen.findByText('Well')

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Raquel' },
    })

    expect(screen.getByText(/pesquisando por Raquel/)).toBeInTheDocument()
    expect(screen.queryByText('Well')).toBeNull()
  })
  it('filter contact that do match input text', async () => {
    renderComponent()

    await waitFor(() => {
      fireEvent.change(screen.getByRole('textbox'), {
        target: { value: 'Raquel' },
      })
      const tag = screen.getByRole('heading', { name: 'Raquel' })

      expect(tag).toBeInTheDocument()
      expect(tag.tagName.toLowerCase()).toBe('h3')
    })
  })
})
