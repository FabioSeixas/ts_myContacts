import { describe, expect, test, vi } from 'vitest'
import { IContact, INetworkInfo } from './types'
import { EVENT_LIST_CONTACTS } from './constants'
import { makeContactService } from '.'
import { EventManager } from '../eventManager'

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

describe('Contacts Service Tests', () => {
  describe('Offline', () => {
    describe('Observable pattern', () => {
      test('should not notify a detached listener', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        let contactListOne: any[] = []
        let contactListTwo: any[] = []

        function mockHandlerOne(data: any[]) {
          contactListOne = data
        }
        function mockHandlerTwo(data: any[]) {
          contactListTwo = data
        }

        s.attach(mockHandlerOne)
        s.attach(mockHandlerTwo)

        // act
        s.detach(mockHandlerTwo)

        const newContact = { id: '321', name: 'Joao' }
        s.create(newContact)

        // assert
        expect(contactListOne[0]).toEqual(newContact)
        expect(contactListTwo[0]).toBeFalsy()
        expect(contactListTwo.length).toBe(0)
      })
      test('should detach listeners', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        function mockHandlerOne(_: any[]) {
          console.log('')
        }
        function mockHandlerTwo(_: any[]) {
          console.log('')
        }

        s.attach(mockHandlerOne)
        s.attach(mockHandlerTwo)

        // act
        s.detach(mockHandlerTwo)

        // assert
        expect(stubEventManager.countEventListeners(EVENT_LIST_CONTACTS)).toBe(
          1
        )
      })
      test('should notify listeners when update happens', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        let contactList: any[] = []
        function mockHandler(data: any[]) {
          contactList = data
        }

        s.attach(mockHandler)
        const newContact = { id: '321', name: 'Joao' }

        // act
        s.create(newContact)

        // assert
        expect(contactList[0]).toEqual(newContact)
      })
      test('should accept new listeners', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        function mockHandler(_: any[]) {
          console.log('')
        }

        // act
        s.attach(mockHandler)
        s.attach(mockHandler)
        s.attach(mockHandler)

        // assert
        expect(stubEventManager.countEventListeners(EVENT_LIST_CONTACTS)).toBe(
          3
        )
      })
    })
    describe('Creation', () => {
      test('should not touch remote source on offline creation', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const spyRDS = vi.spyOn(remoteDS, 'create')
        const spyLDS = vi.spyOn(localDS, 'save')

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act
        s.create({
          id: '1345',
          name: 'user test',
        })

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(spyLDS).toHaveBeenCalled()
        expect(spyRDS).not.toHaveBeenCalled()
      })
      test('should add new item to local data source without touching the existing items', async () => {
        // arrange
        const existentDataOnCache = [
          { name: 'user 1', id: '1' },
          { name: 'user 2', id: '2' },
        ]
        const localDS = makeStubLocalDataSource(existentDataOnCache)
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act
        s.create({
          id: '1345',
          name: 'user test',
        })

        await new Promise<void>((res) => setTimeout(() => res(), 1))
        // assert
        expect(
          localDS.read().find((contact) => contact.id == '1345')
        ).toBeTruthy()
        expect(localDS.read().find((contact) => contact.id == '1')).toBeTruthy()
        expect(localDS.read().find((contact) => contact.id == '2')).toBeTruthy()
      })
    })
    describe('Listing', () => {
      test('should not touch remote', async () => {
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const spy = vi.spyOn(remoteDS, 'list')

        const s = makeContactService(localDS, remoteDS, networkInfo)

        s.attach(() => {})

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        expect(spy).not.toHaveBeenCalled()
      })

      test('should not update cache with remote data', async () => {
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        s.attach(() => {})

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        expect(localDS.read().length).toBe(0)
      })

      test('should notify listeners with data from local data source', async () => {
        const existentDataOnCache = [
          { name: 'user 1', id: '1' },
          { name: 'user 2', id: '2' },
        ]
        const localDS = makeStubLocalDataSource(existentDataOnCache)
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(false)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        s.attach(() => {})

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        const dataFromCache = localDS.read()

        expect(dataFromCache.length).toBe(2)
        expect(dataFromCache).toEqual(
          expect.arrayContaining(existentDataOnCache)
        )
      })
    })
  })

  describe('Online', () => {
    describe('Observable', () => {
      test('should not notify a detached listener', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo()

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        let contactListOne: any[] = []
        let contactListTwo: any[] = []

        function mockHandlerOne(data: any[]) {
          contactListOne = data
        }
        function mockHandlerTwo(data: any[]) {
          contactListTwo = data
        }

        s.attach(mockHandlerOne)
        s.attach(mockHandlerTwo)

        // act
        s.detach(mockHandlerTwo)

        const newContact = { id: '321', name: 'Joao' }
        s.create(newContact)
        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(contactListOne[0]).toEqual(newContact)
        expect(contactListTwo[0]).toBeFalsy()
        expect(contactListTwo.length).toBe(0)
      })
      test('should detach listeners', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo()

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        function mockHandlerOne(_: any[]) {
          console.log('')
        }
        function mockHandlerTwo(_: any[]) {
          console.log('')
        }

        s.attach(mockHandlerOne)
        s.attach(mockHandlerTwo)

        // act
        s.detach(mockHandlerTwo)

        // assert
        expect(stubEventManager.countEventListeners(EVENT_LIST_CONTACTS)).toBe(
          1
        )
      })
      test('should notify listeners when update happens', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo()

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        let contactList: any[] = []
        function mockHandler(data: any[]) {
          contactList = data
        }

        s.attach(mockHandler)
        const newContact = { id: '321', name: 'Joao' }

        // act
        s.create(newContact)
        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(contactList[0]).toEqual(newContact)
      })
      test('should accept new listeners', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo()

        const stubEventManager = new EventManager()

        const s = makeContactService(
          localDS,
          remoteDS,
          networkInfo,
          stubEventManager
        )

        function mockHandler(_: any[]) {
          console.log('')
        }

        // act
        s.attach(mockHandler)
        s.attach(mockHandler)
        s.attach(mockHandler)

        // assert
        expect(stubEventManager.countEventListeners(EVENT_LIST_CONTACTS)).toBe(
          3
        )
      })
    })
    describe('Creation', () => {
      test('should POST to remote source', async () => {
        // arrange
        const localDS = makeStubLocalDataSource()
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(true)

        const spyRDS = vi.spyOn(remoteDS, 'create')
        const spyLDS = vi.spyOn(localDS, 'save')

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act
        s.create({
          id: '1345',
          name: 'user test',
        })

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(spyLDS).toHaveBeenCalled()
        expect(spyRDS).toHaveBeenCalled()
      })
      test('should update local data source if POST returns SUCCESS', async () => {
        // arrange
        const existentDataOnCache = [
          { name: 'user 1', id: '1' },
          { name: 'user 2', id: '2' },
        ]

        const localDS = makeStubLocalDataSource(existentDataOnCache)
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(true)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act
        s.create({
          id: '1345',
          name: 'user test',
        })

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(localDS.read().length).toBe(3)
      })
      test('should add new item to local data source even if this last one is empty', async () => {
        // arrange
        const localDS = makeStubLocalDataSource([])
        const remoteDS = makeStubRemoteDataSource()
        const networkInfo = makeStubNetworkInfo(true)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act
        s.create({
          id: '1345',
          name: 'user test',
        })

        await new Promise<void>((res) => setTimeout(() => res(), 1))

        // assert
        expect(localDS.read().length).toBe(1)
      })
      test('should NOT update local data source if POST returns ERROR', async () => {
        // arrange
        const localDS = makeStubLocalDataSource([])
        const remoteDS = makeStubRemoteDataSource(true)
        const networkInfo = makeStubNetworkInfo(true)

        const s = makeContactService(localDS, remoteDS, networkInfo)

        // act and assert
        expect(() =>
          s.create({
            id: '1345',
            name: 'user test',
          })
        ).rejects.toThrowError('somethingWentWrong')

        expect(localDS.read().length).toBe(0)
      })
    })
    test('should list contacts', async () => {
      const localDS = makeStubLocalDataSource()
      const remoteDS = makeStubRemoteDataSource()
      const networkInfo = makeStubNetworkInfo()

      const s = makeContactService(localDS, remoteDS, networkInfo)

      s.attach(() => {})

      await new Promise<void>((res) => setTimeout(() => res(), 1))

      expect(localDS.read()).toEqual(expect.arrayContaining(remoteContactList))
    })

    test('should update local with remote', async () => {
      // arrange
      const existingContactList = [
        { name: 'Lucas', id: '5' },
        { name: 'Renata', id: '6' },
      ]

      const localDS = makeStubLocalDataSource(existingContactList)
      const remoteDS = makeStubRemoteDataSource()
      const networkInfo = makeStubNetworkInfo()

      const s = makeContactService(localDS, remoteDS, networkInfo)

      // act
      s.attach(() => {})

      await new Promise<void>((res) => setTimeout(() => res(), 1))

      // assert
      expect(localDS.read()).toEqual(
        expect.arrayContaining([...remoteContactList, ...existingContactList])
      )
    })

    test('should update local with remote and no duplicates', async () => {
      // arrange
      const existingContactList = [
        { name: 'Well', id: '1' },
        { name: 'Renata', id: '40' },
      ]

      const localDS = makeStubLocalDataSource(existingContactList)
      const remoteDS = makeStubRemoteDataSource()
      const networkInfo = makeStubNetworkInfo()

      const s = makeContactService(localDS, remoteDS, networkInfo)

      // act
      s.attach(() => {})

      await new Promise<void>((res) => setTimeout(() => res(), 1))

      // assert
      const localDSItemsId = localDS.read().map((item) => item.id)
      const localDSUniqueItemsId = new Set(localDSItemsId)

      expect(localDSItemsId.length).toBe(localDSUniqueItemsId.size)
    })
  })
})
