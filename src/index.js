// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }

  detach() {
    this.originalStyle = playerWrapper().attr('style')
    this.$('.detach-button').html('X attach X')
    resizePlayeAandMoveToBottomLeft()
    enablePlayerDrag()
  }

  resizePlayerAndMoveToBottomLeft(){
    // playerWrapper.
  }

  enablePlayerDrag() {
    this.draggable = new Drag(playerWrapper)
    this.draggable.init()
  }

  attach() {
    this.draggable.destroy()
    this.draggable = null

    playerWrapper.attr('style', this.originalStyle)
    this.$('.detach-button').html('\\/ detach \\/')
  }

  render() {
    this.$el.html('<span class="detach-button">\\/ Detach \\/</span>')
    playerWrapper.append(this.$el)

    this.$el.on('click', ::this.toggleDetach)

    return this
  }
}
