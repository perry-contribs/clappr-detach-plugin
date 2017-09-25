/* eslint-disable import/extensions, import/no-unresolved */
import $ from 'clappr-zepto/zepto'
/* eslint-enable import/extensions, import/no-unresolved */

import interact from 'interact.js'

const draggableAreaClassName = 'clappr-detach__draggable-area'

let $draggableBoundary

const createDraggableBoundary = () => {
  $draggableBoundary = $('<div>')
  $draggableBoundary.addClass = draggableAreaClassName

  $draggableBoundary.css({
    position: 'fixed',
    top: '5vh',
    left: '5vw',
    width: '90vw',
    height: '90vh',
    pointerEvents: 'none',
  })

  $('body').prepend($draggableBoundary)

  return $draggableBoundary[0]
}

const getDraggableBoundary = () => {
  if ($draggableBoundary) {
    return $draggableBoundary[0]
  }

  return createDraggableBoundary()
}

const onStart = (event) => {
  const { target } = event
  target.style.transition = 'none'
  target.setAttribute('data-x', null)
  target.setAttribute('data-y', null)
}

const onMove = (event) => {
  const { target } = event

  // keep the dragged position in the data-x/data-y attributes
  const [currentX, currentY] = target.style.transform.match(/-?[\d.]+/g)
  const x = (parseFloat(target.getAttribute('data-x')) || parseFloat(currentX) || 0) + event.dx
  const y = (parseFloat(target.getAttribute('data-y')) || parseFloat(currentY) || 0) + event.dy

  // translate the element
  const transform = `translate(${x}px, ${y}px)`
  target.style.webkitTransform = transform
  target.style.transform = transform

  // update the posiion attributes
  target.setAttribute('data-x', x)
  target.setAttribute('data-y', y)
}

const setupDrag = (element) => {
  const draggableBoundary = getDraggableBoundary()

  interact(element)
    .draggable({
      enagle: true,
      inertia: true,
      autoScroll: false,
      restrict: {
        restriction: draggableBoundary,
        endOnly: true,
        elementRect: {
          top: 0, left: 0, bottom: 1, right: 1,
        },
      },
      onstart: onStart,
      onmove: onMove,
    })
}

const setupDrop = (element, { dropAreaElement, onDrop }) => {
  const elementSelector = `.${element.className}`

  interact(dropAreaElement)
    .dropzone({
      accept: elementSelector,
      overlap: 0.75,
      ondrop: onDrop,
    })
}

const setupInteractions = (element, { drag, drop }) => {
  if (drag) {
    setupDrag(element)
  }
  if (drop) {
    setupDrop(element, drop)
  }
}

export default setupInteractions
