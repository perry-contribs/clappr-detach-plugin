let el

export const addDragArea = () => {
  if (el) {
    return el
  }
  el = document.createElement('div')
  el.classList.add('clappr-detach__draggable-area')
  document.body.prepend(el)
  return el
}

export const removeDragArea = () => {
  if (!el) {
    return
  }
  el.remove()
  el = undefined
}
