const { UICorePlugin, Events, Styler, template } = Clappr

import Drag from './draggable.js'

import DetachMediaControlButton from './public/detach-media-control-button.html'
import DetachPlaceholder from './public/detach-placeholder.html'
import DetachIcon from './public/detach-icon.svg'

import DetachStyle from './public/detach.scss'

export default class ClapprDetachPlugin extends UICorePlugin {
  static pluginName = 'detach'

  get name() { return ClapprDetachPlugin.pluginName }

  get mediaControlButtonTemplate() { return template(DetachMediaControlButton) }
  get placeholderTemplate() { return template(DetachPlaceholder) }
  get iconTemplate() { return template(DetachIcon) }

  get iconMarkup() { return this.iconTemplate() }
  get placeholderMarkup() {
    return this.placeholderTemplate({
      icon: this.iconMarkup,
      backgroundImage: this.poster
    })
  }
  get mediaControlButtonMarkup() {
    return this.mediaControlButtonTemplate({
      icon: this.iconMarkup
    })
  }

  get mediaControlDetachButton() {
    return this.mediaControl.$el.find('.clappr-detach__media-control-button')
  }

  get playerWrapper() { return this.core.$el }
  get mediaControl() { return this.core.mediaControl }
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }
  get seekBarContainer() { return this.mediaControl.$el.find('.media-control-center-panel') }
  get poster() { return this.core.options.poster ? this.core.options.poster : 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' }
  get attributes() {
    return {
      'class': 'clappr-detach',
      'data-detach-selector': ''
    }
  }

  bindEvents() {
    this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.onMediaControlRendered)
  }

  render() {
    this.renderPlaceholder()
    this.renderStylesheet()
    this.appendStatics()

    this.core.$el.append(this.el)

    return this
  }

  renderPlaceholder() {
    this.$el.html(this.placeholderMarkup)
  }

  renderMediaControlButton() {
    this.mediaControl.setKeepVisible(true)

    const rightPanel = this.mediaControl.$el.find('.media-control-right-panel')
    rightPanel.append(this.mediaControlButtonMarkup)
  }

  renderStylesheet() {
    const detachStyle = Styler.getStyleFor(DetachStyle)
    this.$el.append(detachStyle)
  }

  appendStatics() {
    this.core.$el.append(this.el)
  }

  onMediaControlRendered() {
    this.renderMediaControlButton()
    this.mediaControlDetachButton.on('click', ::this.toggleDetach)
  }

  //
  // resizeAndRepositionPlayer() {
  //   // this.addPlaceholder()
  //   this.hidePlayer()
  //   this.enablePlayerDrag()
  //   this.enableMiniPlayer()
  // }
  //
  // hidePlayer() {
  //   this.playerWrapper.css({
  //     opacity: 0
  //   })
  // }
  //
  // enablePlayerDrag() {
  //   this.disablePauseClick()
  //   this.draggable = new Drag(this.playerWrapper[0])
  //   this.draggable.init()
  // }
  //
  // disablePlayerDrag() {
  //   this.enablePauseClick()
  //   this.draggable.destroy()
  //   this.draggable = null
  // }
  //
  // enablePauseClick() {
  //   this.clickToPausePlugin.enable()
  // }
  //
  // disablePauseClick() {
  //   this.clickToPausePlugin.disable()
  // }
  //
  // enableMiniPlayer() {
  //   this.hideSeekBar()
  //   this.playerWrapper.css({
  //     transition: 'opacity 1s ease',
  //     transition: 'transform 0.5s ease-in-out',
  //     transform: 'translateY(-130px)',
  //     opacity: 1,
  //     height: '180px',
  //     width: '320px',
  //     left: '10px',
  //     bottom: '-100px',
  //     zIndex: '99999'
  //   })
  // }
  //
  // disableMiniPlayer() {
  //   this.playerWrapper.attr('style', this.originalStyle)
  //   this.showSeekBar()
  // }
  //
  // attach() {
  //   this.disablePlayerDrag()
  //   this.removePlaceholder()
  //   this.disableMiniPlayer()
  //   // this.mediaControl.$('.detach-button').html('\\/ detach \\/')
  // }
  //
  // detach() {
  //   this.originalStyle = this.playerWrapper.attr('style')
  //   this.resizeAndRepositionPlayer()
  // }
  //
  // addPlaceholder() {
  //   let placeholder = document.createElement('div')
  //
  //   placeholder.setAttribute('style', this.originalStyle)
  //   placeholder.setAttribute('class', 'video-placeholder')
  //   placeholder.style.display = 'flex'
  //   placeholder.style.justifyContent = 'center'
  //   placeholder.style.alignItems = 'center'
  //   placeholder.style.position = 'relative'
  //
  //   const button = this.placeholderDetachButton()
  //   if (document.attachEvent) {
  //     button.attachEvent('onclick', ::this.toggleDetach)
  //   } else {
  //     button.addEventListener('click', ::this.toggleDetach)
  //   }
  //
  //   let css = document.createElement('style')
  //   css.class = 'clappr-style'
  //   css.innerHTML = '.video-placeholder:before { content:""; position:absolute; width:100%; height:100%; background:inherit; z-index:-1; -webkit-filter: blur(5px); -moz-filter: blur(5px); -o-filter: blur(5px); -ms-filter: blur(5px); filter: blur(5px); top:0; left:0; opacity: 0.85; background-size:100% 100%; background-image:'+ 'url(' + this.poster + ');' +' }'
  //
  //   placeholder.appendChild(css)
  //   placeholder.appendChild(button)
  //   this.playerWrapper.parent().prepend(placeholder)
  // }
  //
  // removePlaceholder() {
  //   this.playerWrapper.siblings('.video-placeholder').remove()
  // }
  //
  // insertButton() {
  //   this.mediaControl.$el.find('.media-control-right-panel').append(this.$el)
  // }
  //
  // showSeekBar() {
  //   this.seekBarContainer.show()
  // }
  //
  // hideSeekBar() {
  //   this.seekBarContainer.hide()
  // }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }
}
