/* eslint-disable import/extensions, import/no-unresolved */
import $ from 'clappr-zepto/zepto'
/* eslint-enable import/extensions, import/no-unresolved */

import interact from 'interact.js'

export default class Interactions {
  draggableAreaClassName = 'clappr-detach__draggable-area'

  constructor(element, options) {
    this.element = element

    if (options.drag) this.dragOn(options.drag)
    if (options.drop) this.dropOn(options.drop)
  }

  dropOn({ dropAreaClass, onDrop }) {
    const dropAreaSelector = `.${dropAreaClass}`
    const elementSelector = `.${this.element.className}`

    interact(dropAreaSelector)
      .dropzone({
        accept: elementSelector,
        overlap: 0.75,
        ondrop: onDrop,
      })
  }

  dragOn() {
    const draggableBoundary = this.getDraggableBoundary()

    interact(this.element)
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
        onstart: this.onStart,
        onmove: this.onMove,
      })
  }

  onStart = (event) => {
    const { target } = event
    target.style.transition = 'none'
    target.setAttribute('data-x', null)
    target.setAttribute('data-y', null)
  }

  onMove = (event) => {
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

  getDraggableBoundary() {
    const draggableBoundary = $(`.${this.draggableAreaClassName}`)

    if (draggableBoundary.length > 0) {
      return draggableBoundary[0]
    }

    return this.createDraggableBoundary()
  }

  createDraggableBoundary() {
    const draggableBoundary = document.createElement('div')
    draggableBoundary.className = this.draggableAreaClassName

    $(draggableBoundary).css({
      position: 'fixed',
      top: '5vh',
      left: '5vw',
      width: '90vw',
      height: '90vh',
      pointerEvents: 'none',
    })

    $('body').prepend(draggableBoundary)

    return draggableBoundary
  }
}
