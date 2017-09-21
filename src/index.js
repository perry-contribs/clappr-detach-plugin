/* eslint-disable import/extensions, import/no-unresolved */
import { UICorePlugin, Events, Styler, template } from 'clappr'
import $ from 'clappr-zepto/zepto'
/* eslint-enable import/extensions, import/no-unresolved */

import Interactions from './interactions'

// assets
import DetachMediaControlButton from './assets/detach-media-control-button.html'
import DetachPlaceholder from './assets/detach-placeholder.html'
import DetachIcon from './assets/detach-icon.svg'
import DetachStyle from './assets/detach.scss'

const POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

export default class ClapprDetachPlugin extends UICorePlugin {
  static iconMarkup = template(DetachIcon)()

  static mediaControlButtonMarkup = template(DetachMediaControlButton)({
    icon: ClapprDetachPlugin.iconMarkup,
  })

  constructor(core) {
    super(core)

    if (core.ready) {
      this.onCoreReady()
    }
  }

  name = 'detach'

  get placeholderMarkup() {
    return template(DetachPlaceholder)({
      icon: ClapprDetachPlugin.iconMarkup,
      backgroundImage: this.poster,
    })
  }

  get mediaControlDetachButton() {
    return this.mediaControl.$el.find('.clappr-detach__media-control-button')
  }

  get customOptions() { return this.core.options.detachOptions }

  defaultOptions = {
    orientation: 'bottom-left',
    opacity: 1,
    width: 320,
    height: 180,
    detachOnStart: true,
    onAttach: () => {},
    onDetach: () => {},
  }

  get options() {
    if (!this.opts) {
      this.opts = { ...this.defaultOptions, ...this.core.options.detachOptions }
    }
    return this.opts
  }

  get miniPlayerOptions() {
    const { orientation, detachOnStart, ...options } = this.options
    return { ...options, ...this.orientationOptions(orientation) }
  }

  get playerWrapper() { return this.core.$el }
  get mediaControl() { return this.core.mediaControl }
  get currentContainer() { return this.core.getCurrentContainer() }
  get seekBarContainer() { return this.mediaControl.$el.find('.media-control-center-panel') }
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }

  get poster() { return this.core.options.poster ? this.core.options.poster : POSTER }

  /* eslint-disable class-methods-use-this */
  get attributes() {
    return {
      class: 'clappr-detach',
    }
  }

  orientationOptions(orientation) {
    const options = {}

    orientation.split('-').forEach((side) => {
      if (side === 'left') { options.left = 10 }
      if (side === 'right') { options.right = 10 }
      if (side === 'bottom') {
        options.transform = 'translate(0, -130px)'
        options.bottom = -100
      }
      if (side === 'top') {
        options.transform = 'translate(0, 130px)'
        options.top = -100
      }
    })

    return options
  }
  /* eslint-enable class-methods-use-this */

  getExternalInterface() {
    return {
      detach: this.detach,
      attach: this.attach,
    }
  }

  /*
    events
  */
  bindEvents() {
    this.listenTo(this.core, Events.CORE_OPTIONS_CHANGE, this.onOptionsChange)
    this.listenTo(this.core, Events.CORE_READY, this.onCoreReady)
    this.listenTo(this.core, Events.CORE_FULLSCREEN, this.onCoreFullScreen)
    this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.onMediaControlRendered)
  }

  createPlaceholder() {
    this.$el.find('.clappr-detach__placeholder-icon').off('click', this.toggleDetach)
    this.$el.html(this.placeholderMarkup)
    this.$el.find('.clappr-detach__placeholder-icon').on('click', this.toggleDetach)
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
    rightPanel.append(ClapprDetachPlugin.mediaControlButtonMarkup)
  }

  onCoreReady() {
    this.listenTo(this.currentContainer, Events.CONTAINER_PLAY, this.onContainerPlay)

    this.removePreviousStatics()
    this.appendStatics()
  }

  onCoreFullScreen(fullscreen) {
    if (fullscreen) {
      this.hideMediaControllButton()
    } else {
      if (this.isDetached()) {
        // FIXME
        setTimeout(() => {
          this.core.resize({
            width: this.options.width,
            height: this.options.height,
          })
        }, 10)
      } else {
        this.playerWrapper.attr('style', this.originalStyle)
      }

      this.showMediaControllButton()
    }
  }

  onMediaControlRendered() {
    this.renderMediaControlButton()
    this.mediaControlDetachButton.on('click', this.toggleDetach)
  }

  onOptionsChange() {
    this.render()
  }

  onContainerPlay() {
    if (!this.detachedOnStart && this.options.detachOnStart) {
      this.detachedOnStart = true
      this.detach()
    }
  }

  resizeAndRepositionPlayer() {
    this.hidePlayer()
    this.enablePlayerDrag()
    this.enableMiniPlayer()
  }

  hidePlayer() {
    this.playerWrapper.css({
      opacity: 0,
    })
  }

  enablePlayerDrag() {
    this.disablePauseClick()
    this.draggable = new Interactions(this.detachWrapper, {
      drag: true,
      drop: {
        dropAreaClass: this.el.className,
        onDrop: this.attach,
      },
    })
  }

  disablePlayerDrag() {
    this.enablePauseClick()
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
      opacity: 1,
    })

    $(this.detachWrapper).css(this.miniPlayerOptions)
    this.setDefaultDetachWrapperPosition()
    // FIXME
    setTimeout(() => {
      $(this.detachWrapper).css(this.orientationOptions(this.options.orientation))
    }, 10)
  }

  movePlayerToDetachedWrapper() {
    $('body').append(this.detachWrapper)
    this.defaultPlayerWrapper = this.playerWrapper.parent()
    $(this.detachWrapper).append(this.playerWrapper[0])
  }

  setDefaultDetachWrapperPosition() {
    $(this.detachWrapper).css({
      transform: 'translate(0, 0)',
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
    if (this.defaultPlayerWrapper) {
      this.defaultPlayerWrapper.append(this.playerWrapper[0])
    }
  }

  isDetached() {
    return this.detached
  }

  /*
    actions
  */
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

  toggleDetach = () => {
    if (this.isDetached()) {
      this.attach()
    } else {
      this.detach()
    }
  }

  attach = () => {
    if (this.isDetached()) {
      this.detached = false
      const isPlaying = this.currentContainer.isPlaying()
      this.disablePlayerDrag()
      this.hidePlaceholder()
      this.disableMiniPlayer()

      if (isPlaying) {
        this.currentContainer.play()
      }

      this.options.onAttach()
    }
  }

  detach() {
    if (!this.isDetached()) {
      this.detached = true
      const isPlaying = this.currentContainer.isPlaying()
      if (isPlaying) {
        this.currentContainer.pause()
      }

      this.originalStyle = this.playerWrapper.attr('style')
      this.resizeAndRepositionPlayer()
      this.showPlaceholder()

      if (isPlaying) {
        this.currentContainer.play()
      }

      this.options.onDetach()
    }
  }

  render() {
    const detachWrapperClassName = 'clappr-detach__wrapper'
    this.detachWrapper = $(`.${detachWrapperClassName}`)

    if (this.detachWrapper.length === 0) {
      this.detachWrapper = document.createElement('div')
      this.detachWrapper.className = detachWrapperClassName
    }

    this.createPlaceholder()
    this.createStylesheet()
  }
}
