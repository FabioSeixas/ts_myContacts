import { EVENT_LIST_CONTACTS } from './constants'
import {
  INetworkInfo,
  ILocalDataSource,
  IRemoteDataSource,
  IEventManager,
  IContact,
  IContactService,
} from './types'

export class ContactService implements IContactService {
  constructor(
    private localDataSource: ILocalDataSource,
    private remoteDataSource: IRemoteDataSource,
    private eventManager: IEventManager,
    private networkInfo: INetworkInfo
  ) {}

  private getCacheData() {
    return this.localDataSource.read()
  }

  private mergeDataSources(remoteDSItems: IContact[]) {
    const localDSItems = this.getCacheData()
    const array = [...remoteDSItems, ...localDSItems]

    const uniqueItems = new Map<string, IContact>()

    array.forEach((item) => {
      uniqueItems.set(item.id, item)
    })

    this.localDataSource.save(Array.from(uniqueItems.values()))
  }

  private listContacts() {
    if (!this.networkInfo.isConnected()) {
      this.notifyListeners()
      return
    }
    this.remoteDataSource
      .list()
      .then((networkContacts: IContact[]) => {
        if (networkContacts.length) {
          this.mergeDataSources(networkContacts)
        }
        this.notifyListeners()
      })
      .catch((e: Error) => {
        console.log('algo deu errado no GET /contacts')
        console.log(e)
        console.log('Listando contatos salvos em cache.')
        this.notifyListeners()
      })
  }

  private notifyListeners() {
    this.eventManager.emit(EVENT_LIST_CONTACTS, this.getCacheData())
  }

  attach(handler: (data: IContact[]) => void) {
    this.eventManager.on(EVENT_LIST_CONTACTS, handler)
    this.listContacts()
  }

  async create(newContact: IContact): Promise<IContact> {
    // TODO: id must be created here, not passed inside payload
    if (!this.networkInfo.isConnected()) {
      this.mergeDataSources([newContact])
      this.notifyListeners()
      return newContact
    }

    const result = await this.remoteDataSource.create(newContact)

    this.mergeDataSources([result])
    this.notifyListeners()
    return result
  }

  async remove(contactId: string): Promise<true> {
    if (this.networkInfo.isConnected()) {
      await this.remoteDataSource
        .remove(contactId)
        .catch((err) => console.error(err))
    }
    const contactList = this.localDataSource.read()
    const updatedContactList = contactList.filter(
      (contact) => contact.id != contactId
    )
    this.localDataSource.save(updatedContactList)
    this.notifyListeners()
    return true
  }

  detach(handler: (data: IContact[]) => void): void {
    this.eventManager.removeListener(EVENT_LIST_CONTACTS, handler)
  }
}
