import { EventPayload, EventCallback } from '../eventManager/types'

export interface IContactService {
  attach(handler: (data: IContact[]) => void): void
  detach(handler: (data: IContact[]) => void): void
  create(newContact: IContact): Promise<IContact>
}

export interface IContact {
  id: string
  name: string
  email?: string
  phone?: string
  category?: string
}

export interface ILocalDataSource {
  save(contacts: IContact[]): void
  read(): IContact[]
}

export interface IRemoteDataSource {
  list(): Promise<IContact[]>
  create(newContact: IContact): Promise<IContact>
  update(updateContact: IContact): Promise<IContact>
}

export interface IEventManager {
  on(event: string, listener: EventCallback): void
  emit(event: string, payload: EventPayload): void
  removeListener(event: string, listenerToRemove: EventCallback): void
}

export interface INetworkInfo {
  isConnected(): boolean
}
