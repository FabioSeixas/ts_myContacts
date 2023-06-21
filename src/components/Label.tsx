import * as React from 'react'
import { IContactService, IContact } from '../services/contacts/types'

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <>
      <h1>Header</h1>
      {children}
      <h1>Footer</h1>
    </>
  )
}

export function ContactList({ service }: { service: IContactService }) {
  const [contacts, setContacts] = React.useState([] as IContact[])

  React.useEffect(() => {
    const callbackHandler = (contacts: IContact[]) => setContacts(contacts)
    service.attach(callbackHandler)
  }, [])

  return (
    <>
      <h1>Header</h1>
      {contacts.map((c) => (
        <h2>{c.name}</h2>
      ))}
      <h1>Footer</h1>
    </>
  )
}
