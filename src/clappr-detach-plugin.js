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

  get defaultOptions() {
    return {
      orientation: 'bottom-left',
      opacity: 1,
      width: 320,
      height: 180
    }
  }
  get customOptions() { return this.core.options.detachOptions }
  get miniPlayerOptions() {
    const computedOptions = Object.assign({}, this.defaultOptions, this.customOptions)
    const { orientation, ...options } = computedOptions
    return Object.assign({}, options, this.orientationOptions(orientation))
  }

  get playerWrapper() { return this.core.$el }
  get mediaControl() { return this.core.mediaControl }
  get seekBarContainer() { return this.mediaControl.$el.find('.media-control-center-panel') }
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }

  get poster() { return this.core.options.poster ? this.core.options.poster : 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=' }
  get attributes() {
    return {
      'class': 'clappr-detach'
    }
  }

  bindEvents() {
    this.listenTo(this.core, Events.CORE_READY, this.onCoreReady)
    this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.onMediaControlRendered)
  }

  render() {
    this.createPlaceholder()
    this.createStylesheet()

    return this
  }

  createPlaceholder() {
    this.$el.html(this.placeholderMarkup)

    this.$el.find('.clappr-detach__placeholder-icon').on('click', ::this.toggleDetach)
  }

  createStylesheet() {
    const detachStyle = Styler.getStyleFor(DetachStyle)
    this.$el.append(detachStyle)
  }

  appendStatics() {
    this.playerWrapper.parent().append(this.el)
  }

  renderMediaControlButton() {
    this.mediaControl.setKeepVisible(true)

    const rightPanel = this.mediaControl.$el.find('.media-control-right-panel')
    rightPanel.append(this.mediaControlButtonMarkup)
  }

  onCoreReady() {
    this.appendStatics()
  }

  onMediaControlRendered() {
    this.renderMediaControlButton()
    this.mediaControlDetachButton.on('click', ::this.toggleDetach)
  }

  orientationOptions(orientation) {
    let options = {}
    orientation.split('-').forEach((side) => {
      if (side === 'left') { options.left = 10 }
      if (side === 'right') { options.right = 10 }
      if (side === 'bottom') {
        options.transform = 'translateY(-130px)'
        options.bottom = -100
      }
      if (side === 'top') {
        options.transform = 'translateY(130px)'
        options.top = -100
      }
    })
    return options
  }

  resizeAndRepositionPlayer() {
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

    this.playerWrapper.addClass('clappr-detach--detached')
    this.playerWrapper.css(this.miniPlayerOptions)
  }

  disableMiniPlayer() {
    this.showSeekBar()

    this.playerWrapper.removeClass('clappr-detach--detached')
    this.playerWrapper.attr('style', this.originalStyle)
  }

  hidePlaceholder() {
    this.$el.removeClass('clappr-detach--visible')
  }

  showPlaceholder() {
    this.$el.attr('style', this.originalStyle)
    this.$el.addClass('clappr-detach--visible')
  }

  showSeekBar() {
    this.seekBarContainer.show()
  }

  hideSeekBar() {
    this.seekBarContainer.hide()
  }

  toggleDetach() {
    this.draggable ? this.attach() : this.detach()
  }

  attach() {
    this.disablePlayerDrag()
    this.hidePlaceholder()
    this.disableMiniPlayer()
  }

  detach() {
    this.originalStyle = this.playerWrapper.attr('style')
    this.resizeAndRepositionPlayer()
    this.showPlaceholder()
  }
}
