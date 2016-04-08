import interact from 'interact.js'

export default class Interactions {
  constructor(className) {
    this.selector = `.${className}`;
    this.dragOn()
  }

  dragOn() {
    console.log('ligando')
    interact(this.selector)
      .draggable({
        enagle: true,
        inertia: true,
        restriction: {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0
        },
        onmove: ::this.onMove
      })
  }

  onMove(e) {
    console.log(e)
  }
}
