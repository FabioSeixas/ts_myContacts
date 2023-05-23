import { EVENT_LIST_CONTACTS } from './constants'
import { INetworkInfo, ILocalDataSource, IRemoteDataSource, IEventManager } from './types'

export class ContactService {

  constructor(
    private localDataSource: ILocalDataSource,
    private remoteDataSource: IRemoteDataSource,
    private eventManager: IEventManager,
    private networkInfo: INetworkInfo
  ) { }

  getCacheData() {
    return this.localDataSource.read()
  }

  listContacts() {
    this.remoteDataSource
      .list()
      .then((networkContacts: any[]) => {
        if (networkContacts.length) {
          this.localDataSource.save(networkContacts)
        }
        this.eventManager.emit(EVENT_LIST_CONTACTS, this.getCacheData())
      })
      .catch((e: Error) => {
        console.log('algo deu errado no GET /contacts')
        console.log(e)
        console.log('Listando contatos salvos em cache.')
        this.eventManager.emit(EVENT_LIST_CONTACTS, this.getCacheData())
      })
  }

  attach(handler: () => void) {
    console.log(this.eventManager)
    this.eventManager.on('updateContacts', handler)
    this.listContacts()
  }
}

