import * as React from 'react'
import { createPortal } from 'react-dom'
import { IContactService, IContact } from '../services/contacts/types'
import TrashIcon from '../assets/trash.svg'

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
  const [removeContactModalOpen, setRemoveContactModalOpen] = React.useState<
    null | string
  >(null)

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
      {isSearching && thereAreResults && (
        <p> pesquisando por {`${searchInput}`}</p>
      )}
      {isSearching && !thereAreResults && (
        <p> Nenhum resultado para "{`${searchInput}`}"</p>
      )}

      <ul>
        {filteredContacts.map((contact) => (
          <li>
            <h3 key={contact.id}>{contact.name}</h3>
            <button
              aria-label="remove"
              onClick={() => setRemoveContactModalOpen(contact.id)}
            >
              <img src={TrashIcon} />
            </button>
          </li>
        ))}
      </ul>

      {Boolean(removeContactModalOpen) &&
        createPortal(
          <div>
            <p>Deseja remover contato?</p>
            <button
              aria-label="remove-confirm"
              onClick={() => {
                service.delete?.(removeContactModalOpen)
                setTimeout(() => {
                  setRemoveContactModalOpen(null)
                })
              }}
            >
              Confirmar
            </button>
          </div>,
          document.body
        )}
    </>
  )
}
