import { EventManager } from '../eventManager'
import { ContactService } from './service'
import { INetworkInfo, ILocalDataSource, IRemoteDataSource, IContactService, IEventManager } from './types'

export function makeContactService(
  localDataSource: ILocalDataSource,
  remoteDataSource: IRemoteDataSource,
  networkInfo: INetworkInfo,
  eventManager?: IEventManager
): IContactService {
  return new ContactService(
    localDataSource,
    remoteDataSource,
    eventManager ?? new EventManager(),
    networkInfo
  )
} 

