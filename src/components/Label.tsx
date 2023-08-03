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
  const [firstLoading, setFirstLoading] = React.useState(true)

  const [contacts, setContacts] = React.useState([] as IContact[])
  const [searchInput, setSearchInput] = React.useState('')

  React.useEffect(() => {
    const callbackHandler = (contacts: IContact[]) => {
      setFirstLoading(false)
      setContacts(contacts)
    }
    service.attach(callbackHandler)
  }, [])

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  if (firstLoading) {
    return <h3>Carregando...</h3>
  }

  const isSearching = !!searchInput
  const thereAreResults = !!filteredContacts.length

  return (
    <>
      <input
        value={searchInput}
        type="text"
        placeholder="Pesquisa pelo nome..."
        onChange={(e) => setSearchInput(e.target.value)}
      />
      {isSearching && thereAreResults && <p> pesquisando por {`${searchInput}`}</p>}
      {isSearching && !thereAreResults && <p> Nenhum resultado para "{`${searchInput}`}"</p>}

      {filteredContacts.map((c) => (
        <h3 key={c.id}>{c.name}</h3>
      ))}
    </>
  )
}




