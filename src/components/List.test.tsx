import * as React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { makeContactService } from '../services/contacts'

import { ContactList } from './Label'

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
  it('renders headline', () => {
    const s = makeContactService(
      makeStubLocalDataSource(),
      makeStubRemoteDataSource(),
      makeStubNetworkInfo()
    )
    render(<ContactList service={s} />)


    const elementHTML = screen.findByText('Well')

    screen.debug()
    expect(elementHTML).toBeTruthy()
    // check if App components renders headline
  })
})
