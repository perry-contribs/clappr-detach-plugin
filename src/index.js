// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }

  constructor(core) {
    super(core)

    this.enableMove = false
  }

  // detach(e) {
  //   new Drag('queen')
  //   console.log('Drag queen')
  //   debugger
  //   var container = this.core.containers[0]
  //   if (container.hasPlugin('click_to_pause')) {
  //     container.getPlugin('click_to_pause').disable()
  //   }
  // }

  getContainer() {
    return this.core.containers[0].$el
  }

  detach() {
    console.log('detach', this.enableMove)
    this.enableMove = true
  }

  tryToMove(e) {
    console.log('tryToMove', this.enableMove)
    if (this.enableMove) {
      this.draggable = new Drag(this.core.el)
      this.draggable.init()
      debugger

      this.getContainer().on('mouseup', ::this.unbindDrag)
    }
  }

  unbindDrag(e) {
    this.draggable.destroy()
    this.getContainer().off('mouseup')
  }

  render() {
    console.log(' render')
    this.$el.html('Detach')
    this.core.$el.append(this.$el)

    this.$el.on('click', ::this.detach)
    this.core.$el.on('mousedown', ::this.tryToMove)

    return this
  }
}
