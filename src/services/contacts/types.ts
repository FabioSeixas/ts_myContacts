import { EventPayload, EventCallback } from '../eventManager/types'

export interface IContact {
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
