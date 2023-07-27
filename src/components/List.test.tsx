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

describe('App', () => {
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
  it('filter contact list', async () => {
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
  it('filter contact list (2)', async () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Raquel' },
    })

    screen.debug()
    const raquel = (await screen.findByTestId('contact-item')).textContent
    expect(raquel).toBe('Raquel')
  })
})
