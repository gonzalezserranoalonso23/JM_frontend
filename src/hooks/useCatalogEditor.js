import { useState } from 'react'

export const useCatalogEditor = () => {
  const [modalShow, setModalShow] = useState(false)
  const [item, setItem] = useState(null)
  const [editing, setEditing] = useState(false)

  const openCreate = () => {
    setItem(null)
    setEditing(false)
    setModalShow(true)
  }

  const openEdit = (data) => {
    setItem(data)
    setEditing(true)
    setModalShow(true)
  }

  const close = () => setModalShow(false)

  const remove = (mutate, id) => {
    if (window.confirm('Esta seguro que desea borrar?')) mutate(id)
  }

  return {
    modalShow,
    item,
    editing,
    setEditing,
    openCreate,
    openEdit,
    close,
    remove
  }
}
