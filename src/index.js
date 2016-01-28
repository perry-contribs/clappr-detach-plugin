// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }

  playerWrapper(){
    return this.core.$el
  }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }

  detach() {
    this.originalStyle = this.playerWrapper().attr('style')
    this.$('.detach-button').html('X attach X')
    this.resizeAndRepositionPlayer()
    this.enablePlayerDrag()

    this.addPlaceholder()
  }

  resizeAndRepositionPlayer(){
    this.playerWrapper().css({
      height: '180px',
      width: '320px',
      left: '10px',
      bottom: '10px'
    })
  }

  enablePlayerDrag() {
    this.draggable = new Drag(this.playerWrapper()[0])
    this.draggable.init()
  }

  disablePlayerDrag() {
    this.draggable.destroy()
    this.draggable = null
  }

  attach() {
    this.disablePlayerDrag()
    this.removePlaceholder()

    this.playerWrapper().attr('style', this.originalStyle)
    this.$('.detach-button').html('\\/ detach \\/')
  }

  addPlaceholder() {
    let placeholder = document.createElement('div')
    placeholder.setAttribute('style', this.originalStyle)
    placeholder.setAttribute('class', 'video-placeholder')
    placeholder.style.backgroundColor = 'black'

    this.playerWrapper().parent().prepend(placeholder)
  }

  removePlaceholder() {
    this.playerWrapper().siblings('.video-placeholder').remove()
  }

  render() {
    this.$el.html('<span class="detach-button">\\/ Detach \\/</span>')
    this.playerWrapper().append(this.$el)

    this.$el.on('click', ::this.toggleDetach)

    return this
  }
}
