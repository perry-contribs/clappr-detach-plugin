// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }

  playerWrapper() {
    return this.core.$el
  }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }

  detach() {
    this.originalStyle = this.playerWrapper().attr('style')
    this.$('.detach-button').html('X attach X')
    this.resizePlayerAndMoveToBottomLeft()
    this.enablePlayerDrag()
  }

  resizePlayerAndMoveToBottomLeft() {
    // playerWrapper.
  }

  enablePlayerDrag() {
    this.draggable = new Drag(this.core.el)
    this.draggable.init()
  }

  attach() {
    this.draggable.destroy()
    this.draggable = null

    this.playerWrapper().attr('style', this.originalStyle)
    this.$('.detach-button').html('\\/ detach \\/')
  }

  render() {
    this.$el.html('<span class="detach-button">\\/ Detach \\/</span>')
    this.playerWrapper().append(this.$el)

    this.$el.on('click', ::this.toggleDetach)

    return this
  }
}
