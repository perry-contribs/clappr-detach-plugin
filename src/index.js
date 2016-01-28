// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }

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

  tryToDetach(e) {
    debugger
    this.core.$el.attr('class', 'queen')
    this.draggable = new Drag(this.core.el)
    this.draggable.init()

    this.getContainer().on('mouseup', ::this.unbindDrag)
  }

  unbindDrag(e) {
    this.draggable.destroy()
    this.getContainer().off('mouseup', ::this.unbindDrag)
  }

  render() {
    this.$el.html('Detach')
    this.core.$el.append(this.$el)

    this.$el.on('click', ::this.tryToDetach)

    // this.$el.on('click', ::this.detach)
    // this.$el.css
    // this.core.$el.append(this.$el)
    //
    // this.core.$el.attr('id', 'queen')

    return this
  }
}
