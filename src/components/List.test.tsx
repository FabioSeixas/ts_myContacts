import { render, screen, fireEvent } from '@testing-library/react'
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

describe('App', () => {
  it('on mount, render a loading without contact list', async () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)

    screen.debug()
    expect(screen.getByText(/Carregando/)).toBeInTheDocument()
    expect(screen.queryByText(/Pesquisa/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Well/)).not.toBeInTheDocument()
  })
  // it('After loading, dont render loading', async () => {})
  // it('After loading, render contact list', async () => {})
  // it('On click remove button, open confirm modal', async () => {})
  // it('On click confirm, remove item', async () => {})
  // it('On click add/edit, send to another page', async () => {})
  // it('Should render a message "not found" when search without results', async () => {})

  it('renders a contact', async () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)

    screen.debug()
    expect(await screen.findByText('Well')).toBeInTheDocument()

    screen.debug()
  })
  it('filter out contacts that do not match input text', async () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)

    screen.debug()

    await screen.findByText('Well')

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Raquel' },
    })

    expect(screen.getByText(/pesquisando por Raquel/)).toBeInTheDocument()
    expect(screen.queryByText('Well')).toBeNull()
    screen.debug()
  })
  it('filter contact that do match input list', async () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)
    screen.debug()

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Raquel' },
    })

    const tag = await screen.findByRole('heading', { name: 'Raquel' })
    screen.debug()

    expect(tag).toBeInTheDocument()
    expect(tag.tagName.toLowerCase()).toBe('h3')
  })
})
