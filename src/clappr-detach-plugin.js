const { UICorePlugin, Events, Styler, template } = Clappr

import Drag from './draggable.js'
import Interactions from './interactions.js'

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
    this.listenTo(this.core, Events.CORE_OPTIONS_CHANGE, this.onOptionsChange)
    this.listenTo(this.core, Events.CORE_READY, this.onCoreReady)
    this.listenTo(this.core, Events.CORE_FULLSCREEN, this.onCoreFullScreen)
    this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.onMediaControlRendered)
  }

  render() {
    this.detachWrapper = document.createElement('div')
    this.detachWrapper.className = 'clappr-detach__wrapper'
    this.createPlaceholder()
    this.createStylesheet()

    return this
  }

  createPlaceholder() {
    this.$el.find('.clappr-detach__placeholder-icon').off('click', ::this.toggleDetach)
    this.$el.html(this.placeholderMarkup)
    this.$el.find('.clappr-detach__placeholder-icon').on('click', ::this.toggleDetach)
  }

  createStylesheet() {
    const detachStyle = Styler.getStyleFor(DetachStyle)
    this.$el.append(detachStyle)
  }

  removePreviousStatics() {
    this.playerWrapper.parent().find(this.attributes.class).remove()
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
    this.removePreviousStatics()
    this.appendStatics()
  }

  onCoreFullScreen(fullscreen) {
    if (fullscreen) {
      this.hideMediaControllButton()
      if (this.isDetached()) this.attach()
    } else {
      this.showMediaControllButton()
    }
  }

  onMediaControlRendered() {
    this.renderMediaControlButton()
    this.mediaControlDetachButton.on('click', ::this.toggleDetach)
  }

  onOptionsChange() {
    this.render()
  }

  orientationOptions(orientation) {
    const options = {}
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
    this.draggable = new Interactions(this.detachWrapper.className)
    // this.draggable = new Drag(this.playerWrapper[0])
    // this.draggable.init()
  }

  disablePlayerDrag() {
    this.enablePauseClick()
    // this.draggable.destroy()
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
    this.movePlayerToDetachedWrapper()

    this.playerWrapper.css({
      height: '100%',
      width: '100%',
      opacity: 1
    })

    $(this.detachWrapper).css(this.miniPlayerOptions)
  }

  movePlayerToDetachedWrapper() {
    this.playerWrapper.parent().append(this.detachWrapper)
    $(this.detachWrapper).append(this.playerWrapper[0])
  }

  setDefaultDetachWrapperPosition() {
    $(this.detachWrapper).css({
      transform: "translate(0, 0)"
    })
  }

  disableMiniPlayer() {
    this.showSeekBar()
    this.movePlayerToOriginalPlace()
    this.setDefaultDetachWrapperPosition()
    this.playerWrapper.attr('style', this.originalStyle)
  }

  movePlayerToOriginalPlace() {
    this.playerWrapper.remove()
    $(this.detachWrapper).parent().append(this.playerWrapper[0])
  }

  showPlaceholder() {
    this.$el.attr('style', this.originalStyle)
    this.$el.addClass('clappr-detach--visible')
  }

  hidePlaceholder() {
    this.$el.removeClass('clappr-detach--visible')
  }

  showMediaControllButton() {
    this.mediaControlDetachButton.show()
  }

  hideMediaControllButton() {
    this.mediaControlDetachButton.hide()
  }

  showSeekBar() {
    this.seekBarContainer.show()
  }

  hideSeekBar() {
    this.seekBarContainer.hide()
  }

  isDetached() {
    return this.draggable
  }

  toggleDetach() {
    this.isDetached() ? this.attach() : this.detach()
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
