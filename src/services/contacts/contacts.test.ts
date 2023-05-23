import { describe, expect, test } from 'vitest'
import { IContact, INetworkInfo } from './types'
import { makeContactService } from '.'

const makeStubLocalDataSource = (initalData?: IContact[]) => {

  const source = {
    contacts: initalData ?? [] as IContact[]
  }

  return {
    read() {
      return source.contacts
    },
    save(_contactsList: IContact[]) {
      _contactsList.forEach((item) => {
        source.contacts.push(item)
      })
    },
  }
}

const contactList = [
  { name: 'Well' },
  { name: 'Tom' },
  { name: "Raquel" },
  { name: 'Fabio' }
]

const makeStubRemoteDataSource = () => {
  return {
    create: async function() { 
      return contactList[0]
    },
    update: async function() { 
      return contactList[0]
    },
    list: async function() {
      return contactList
    },
  }
}

const makeStubNetworkInfo = (): INetworkInfo => {
  return {
    isConnected: function() {
      return true
    },
  }
}


describe('Online', () => {
  test('should list contacts', async () => {
    const localDS = makeStubLocalDataSource()
    const remoteDS = makeStubRemoteDataSource()
    const networkInfo = makeStubNetworkInfo()

    const s = makeContactService(localDS, remoteDS, networkInfo)

    s.attach(() => {})

    await new Promise<void>((res) => setTimeout(() => res(), 1))

    expect(localDS.read()).toEqual(
      expect.arrayContaining(
        contactList
      )
    )
  })

  test('should update local with remote', async () => {
    const existingContactList = [
      { name: "Lucas" },
      { name: 'Renata' }
    ]

    const localDS = makeStubLocalDataSource(existingContactList)
    const remoteDS = makeStubRemoteDataSource()
    const networkInfo = makeStubNetworkInfo()

    const s = makeContactService(localDS, remoteDS, networkInfo)

    s.attach(() => {})

    await new Promise<void>((res) => setTimeout(() => res(), 1))

    expect(localDS.read()).toEqual(
      expect.arrayContaining(
        [...contactList, ...existingContactList]
      )
    )
  })

})





