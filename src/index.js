// import { UICorePlugin, Events } from 'Clappr'

// export default class DetachPlugin extends UICorePlugin {
class DetachPlugin extends Clappr.UICorePlugin {
  get name() { return 'detach' }
  get playerWrapper() { return this.core.$el }
  get mediaControl() { return this.core.mediaControl }
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }
  get seekBarContainer() { return this.mediaControl.$el.find('.media-control-center-panel') }
  get attributes() {
    return {
      'class': 'detach-button'
    }
  }

  bindEvents() {
    this.listenTo(this.mediaControl, Clappr.Events.MEDIACONTROL_RENDERED, this.insertButton)

    this.$el.on('click', ::this.toggleDetach)
  }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }

  resizeAndRepositionPlayer() {
    this.addPlaceholder()
    this.hidePlayer()
    this.enablePlayerDrag()
    this.enableMiniPlayer()
  }

  hidePlayer() {
    this.playerWrapper.css({
      opacity: 0
    })
  }

  enablePlayerDrag() {
    this.disablePauseClick()
    this.draggable = new Drag(this.playerWrapper[0])
    this.draggable.init()
  }

  disablePlayerDrag() {
    this.enablePauseClick()
    this.draggable.destroy()
    this.draggable = null
  }

  enablePauseClick() {
    this.clickToPausePlugin.enable()
  }

  disablePauseClick() {
    this.clickToPausePlugin.disable()
  }

  enableMiniPlayer() {
    this.hideSeekBar()
    this.playerWrapper.css({
      transition: 'opacity 1s ease',
      transition: 'transform 0.5s ease-in-out',
      transform: 'translateY(-130px)',
      opacity: 1,
      height: '180px',
      width: '320px',
      left: '10px',
      bottom: '-100px',
      zIndex: '99999'
    })
  }

  disableMiniPlayer() {
    this.playerWrapper.attr('style', this.originalStyle)
    this.showSeekBar()
  }

  attach() {
    this.disablePlayerDrag()
    this.removePlaceholder()
    this.disableMiniPlayer()
    this.mediaControl.$('.detach-button').html('\\/ detach \\/')
  }

  detach() {
    this.originalStyle = this.playerWrapper.attr('style')
    this.resizeAndRepositionPlayer()
  }

  addPlaceholder() {
    let placeholder = document.createElement('div')

    placeholder.setAttribute('style', this.originalStyle)
    placeholder.setAttribute('class', 'video-placeholder')
    placeholder.style.display = 'flex'
    placeholder.style.justifyContent = 'center'
    placeholder.style.alignItems = 'center'
    placeholder.style.position = 'relative'

    const button = this.placeholderDetachButton()
    if (document.attachEvent) {
      button.attachEvent('onclick', ::this.toggleDetach)
    } else {
      button.addEventListener('click', ::this.toggleDetach)
    }

    let css = document.createElement('style')
    css.innerHTML = '.video-placeholder:before { content:""; position:absolute; width:100%; height:100%; background:inherit; z-index:-1; -webkit-filter: blur(5px); -moz-filter: blur(5px); -o-filter: blur(5px); -ms-filter: blur(5px); filter: blur(5px); top:0; left:0; opacity: 0.8; background-size:100% 100%; background-image:'+ 'url(' + this.core.options.poster + ');' +' }'

    placeholder.appendChild(css)
    placeholder.appendChild(button)
    this.playerWrapper.parent().prepend(placeholder)
  }

  placeholderDetachButton() {
    let button = document.createElement('div')
    button.style.width = '20%'
    button.style.height = '20%'
    button.style.cursor = 'pointer'

    button.innerHTML =
      '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 93.08 62" enable-background="new 0 0 93.08 62" xml:space="preserve">' +
        '<path fill="#FFFFFF" d="M0-0.053V62h93.08V-0.053H0z M89.357,58.349H40.461V34.625H3.727V3.598h85.631V58.349z"/>' +
      '</svg>'

    return button
  }

  removePlaceholder() {
    this.playerWrapper.siblings('.video-placeholder').remove()
  }

  insertButton() {
    this.mediaControl.$el.find('.media-control-right-panel').append(this.$el)
  }

  showSeekBar() {
    this.seekBarContainer.show()
  }

  hideSeekBar() {
    this.seekBarContainer.hide()
  }

  render() {
    this.$el.html('\\/ Detach \\/')
    this.$el.css({
      cursor: 'pointer',
      float: 'right',
      background: 'white',
      border: 0,
      height: '100%'
    })

    return this
  }
}
