import { EventManager } from '../eventManager'
import { ContactService } from './service'
import { INetworkInfo, ILocalDataSource, IRemoteDataSource, IContactService } from './types'

export function makeContactService(
  localDataSource: ILocalDataSource,
  remoteDataSource: IRemoteDataSource,
  networkInfo: INetworkInfo
): IContactService {
  return new ContactService(
    localDataSource,
    remoteDataSource,
    new EventManager(),
    networkInfo
  )
} 

