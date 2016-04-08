import interact from 'interact.js'

export default class Interactions {
  constructor(element) {
    this.element = element
    this.dragOn()
  }

  dragOn() {
    this.insertDraggableBoundary()

    interact(this.element)
      .draggable({
        enagle: true,
        inertia: true,
        autoScroll: true,
        restrict: {
          restriction: wrapper,
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
    this.originalTransition = target.style.transition
    target.style.transition = 'none'
  }

  onMove(event) {
    const target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  onEnd(event) {
    const target = event.target
    target.style.transition = this.originalTransition
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

    $('body').prepend(draggableBoundary)
  }

  removeDraggableBoundary() {
    $(this.draggableBoundary).remove()
  }
}
