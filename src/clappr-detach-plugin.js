const { UICorePlugin, Events, Styler, template } = Clappr

import Drag from './draggable.js'

import DetachPlaceholder from './public/detach-placeholder.html'

import DetachStyle from './public/detach.scss'

export default class ClapprDetachPlugin extends UICorePlugin {
  static pluginName = 'detach'

  get name() { return ClapprDetachPlugin.pluginName }
  get detachPlaceholder() { return template(DetachPlaceholder) }
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

  // bindEvents() {
  //   this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.insertButton)
  //   this.$el.on('click', ::this.toggleDetach)
  // }
  //
  // toggleDetach() {
  //   this.draggable ? this.attach() : this.detach()
  // }
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

  placeholder() {
    return this.detachPlaceholder({
      backgroundImage: this.poster
    })
  }

  render() {
    //render media-control icon
    // this.$el.html(this.detachIcon({detachIconClass: 'detach-icon'}))

    //render placeholder
    // this.playerWrapper.parent().prepend(placeholder)

    this.$el.html(this.placeholder())

    const detachStyle = Styler.getStyleFor(DetachStyle)
    this.$el.append(detachStyle)

    this.core.$el.append(this.el)

    return this
  }
}
