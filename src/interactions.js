import interact from 'interact.js'

export default class Interactions {
  constructor(element, options) {
    this.element = element

    if (options.drag) this.dragOn(options.drag);
    if (options.drop) this.dropOn(options.drop);
  }

  dropOn({dropAreaClass, onDrop}) {
    const dropAreaSelector = `.${dropAreaClass}`
    const elementSelector = `.${this.element.className}`

    interact(dropAreaSelector)
      .dropzone({
        accept: elementSelector,
        overlap: 0.75,
        ondrop: onDrop
      })
  }

  dragOn() {
    this.insertDraggableBoundary()

    interact(this.element)
      .draggable({
        enagle: true,
        inertia: true,
        autoScroll: true,
        restrict: {
          restriction: this.draggableBoundary,
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        onstart: ::this.onStart,
        onmove: ::this.onMove,
        onend: ::this.onEnd
      })
  }

  onStart(event) {
    const target = event.target
    target.style.transition = 'none'
    target.setAttribute('data-x', null);
    target.setAttribute('data-y', null);
    this.insertDraggableBoundary()
  }

  onMove(event) {
    const target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      [ currentX, currentY ] = target.style.transform.match(/-?[\d\.]+/g),
      x = (parseFloat(target.getAttribute('data-x')) || parseFloat(currentX) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || parseFloat(currentY) || 0) + event.dy

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  onEnd(event) {
    this.removeDraggableBoundary()
  }

  insertDraggableBoundary() {
    this.draggableBoundary = document.createElement('div')
    this.draggableBoundary.className = 'clappr-detach__draggable-area';

    $(this.draggableBoundary).css({
      position: 'fixed',
      top: '5vh',
      left: '5vw',
      width: '90vw',
      height: '90vh',
      pointerEvents: 'none'
    })

    $('body').prepend(this.draggableBoundary)
  }

  removeDraggableBoundary() {
    $(this.draggableBoundary).remove()
  }
}
