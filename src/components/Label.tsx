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
  const [searchInput, setSearchInput] = React.useState('')

  React.useEffect(() => {
    const callbackHandler = (contacts: IContact[]) => setContacts(contacts)
    service.attach(callbackHandler)
  }, [])

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  return (
    <>

      {!!searchInput && <p> pesquisando por {`${searchInput}`}</p>}

      <input
        value={searchInput}
        type="text"
        placeholder="Pesquisa pelo nome..."
        onChange={(e) => setSearchInput(e.target.value)}
      />

      <h1>Header</h1>

      {filteredContacts.map((c) => (
        <h2 key={c.id} data-testId="contact-item">{c.name}</h2>
      ))}
      <h1>Footer</h1>
    </>
  )
}
