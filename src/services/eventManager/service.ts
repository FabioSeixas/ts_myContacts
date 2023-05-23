import { EventCallback, EventPayload } from './types'

export default class EventManager {

  private listeners: Map<string, EventCallback[]>

  constructor() {
    this.listeners = new Map();
  }

  on(event: string, listener: EventCallback) {

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)?.push(listener);
  }

  emit(event: string, payload: EventPayload) {
    if (!this.listeners.has(event)) {
      return;
    }

    this.listeners.get(event)?.forEach((listener) => {
      listener(payload);
    });
  }

  removeListener(event: string, listenerToRemove: EventCallback) {
    const listeners = this.listeners.get(event);

    if (!listeners) {
      return;
    }

    const filteredListeners = listeners.filter(
      (listener) => listener !== listenerToRemove
    );

    this.listeners.set(event, filteredListeners);
  }
}
