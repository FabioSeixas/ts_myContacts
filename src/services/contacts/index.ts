import { EventManager } from '../eventManager'
import { ContactService } from './service'
import { INetworkInfo, ILocalDataSource, IRemoteDataSource } from './types'

export function makeContactService(
  localDataSource: ILocalDataSource,
  remoteDataSource: IRemoteDataSource,
  networkInfo: INetworkInfo
) {
  return new ContactService(
    localDataSource,
    remoteDataSource,
    new EventManager(),
    networkInfo
  )
} 

