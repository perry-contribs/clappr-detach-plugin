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

const DETACH_STYLE_TAG = Styler.getStyleFor(DetachStyle)

const DEFAULT_POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const DEFAULT_OPTIONS = {
  orientation: 'bottom-left',
  opacity: 1,
  width: 320,
  height: 180,
  detachOnStart: true,
  onAttach: () => {},
  onDetach: () => {},
}

// let options

const iconMarkup = template(DetachIcon)()

const mediaControlButtonMarkup = template(DetachMediaControlButton)({
  icon: iconMarkup,
})

const placeholderMarkup = (poster = DEFAULT_POSTER) => template(DetachPlaceholder)({
  icon: iconMarkup,
  backgroundImage: poster,
})

const orientationOptions = (orientation) => {
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

export default class ClapprDetachPlugin extends UICorePlugin {
  /* eslint-disable class-methods-use-this */
  // clappr uses this - to find the plugin by name
  get name() {
    return 'detach'
  }

  // clappr uses this - to add this class to the player's root element
  get className() {
    return 'clappr-detach'
  }
  /* eslint-enable class-methods-use-this */

  // clappr uses this
  getExternalInterface() {
    return {
      detach: this.detach,
      attach: this.attach,
    }
  }

  constructor(core) {
    super(core)

    this.initOptions(this.core.options.detachOptions)

    if (core.ready) {
      this.onCoreReady()
    }
  }

  get currentContainer() { return this.core.getCurrentContainer() }

  /*
    ---------------------------------------------------------------------------
    events
    ---------------------------------------------------------------------------
  */
  bindEvents() {
    this.listenTo(this.core, Events.CORE_OPTIONS_CHANGE, this.onOptionsChange)
    this.listenTo(this.core, Events.CORE_READY, this.onCoreReady)
    this.listenTo(this.core, Events.CORE_FULLSCREEN, this.onCoreFullScreen)
    this.listenTo(this.mediaControl, Events.MEDIACONTROL_RENDERED, this.onMediaControlRendered)
  }

  onCoreReady() {
    this.listenTo(this.currentContainer, Events.CONTAINER_PLAY, this.onContainerPlay)

    this.removePreviousStatics()
    this.appendStatics()
  }

  /*
    ---------------------------------------------------------------------------
    options
    ---------------------------------------------------------------------------
  */
  initOptions(customOptions) {
    this.opts = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    }
  }

  get options() {
    return this.opts
  }

  onOptionsChange() {
    this.render()
  }

  /*
    ---------------------------------------------------------------------------
    fullscreen
    ---------------------------------------------------------------------------
  */
  onCoreFullScreen(fullscreen) {
    if (fullscreen) {
      this.hideMediaControllButton()
    } else {
      if (this.isDetached) {
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

  onContainerPlay() {
    if (!this.detachedOnStart && this.options.detachOnStart) {
      this.detachedOnStart = true
      this.detach()
    }
  }

  /*
    ---------------------------------------------------------------------------
    media control
    ---------------------------------------------------------------------------
  */
  get mediaControl() { return this.core.mediaControl }
  get mediaControlDetachButton() { return this.mediaControl.$el.find('.clappr-detach__media-control-button') }

  onMediaControlRendered() {
    this.renderMediaControlButton()
    this.mediaControlDetachButton.on('click', this.toggleDetach)
  }

  renderMediaControlButton() {
    this.mediaControl.setKeepVisible(true)

    const rightPanel = this.mediaControl.$el.find('.media-control-right-panel')
    rightPanel.append(mediaControlButtonMarkup)
  }

  showMediaControllButton() {
    this.mediaControlDetachButton.show()
  }

  hideMediaControllButton() {
    this.mediaControlDetachButton.hide()
  }

  /*
    ---------------------------------------------------------------------------
    pause
    ---------------------------------------------------------------------------
  */
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }

  enablePauseClick() {
    this.clickToPausePlugin.enable()
  }

  disablePauseClick() {
    this.clickToPausePlugin.disable()
  }

  /*
    ---------------------------------------------------------------------------
    main player
    ---------------------------------------------------------------------------
  */
  hidePlayer() {
    this.playerWrapper.css({
      opacity: 0,
    })
  }

  resizeAndRepositionPlayer() {
    this.hidePlayer()
    this.enablePlayerDrag()
    this.enableMiniPlayer()
  }

  /*
    ---------------------------------------------------------------------------
    seek bar
    ---------------------------------------------------------------------------
  */
  get seekBarContainer() { return this.mediaControl.$el.find('.media-control-center-panel') }

  showSeekBar() {
    this.seekBarContainer.show()
  }

  hideSeekBar() {
    this.seekBarContainer.hide()
  }

  /*
    ---------------------------------------------------------------------------
    mini player
    ---------------------------------------------------------------------------
  */
  get miniPlayerOptions() {
    const { orientation, detachOnStart, ...options } = this.options
    return { ...options, ...orientationOptions(orientation) }
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
      $(this.detachWrapper).css(orientationOptions(this.options.orientation))
    }, 10)
  }

  disableMiniPlayer() {
    this.showSeekBar()
    this.movePlayerToOriginalPlace()
    this.setDefaultDetachWrapperPosition()
    this.playerWrapper.attr('style', this.originalStyle)
  }

  /*
    ---------------------------------------------------------------------------
    drag
    ---------------------------------------------------------------------------
  */
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

  /*
    ---------------------------------------------------------------------------
    wrapper
    ---------------------------------------------------------------------------
  */
  get playerWrapper() { return this.core.$el }

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

  movePlayerToOriginalPlace() {
    this.playerWrapper.remove()
    if (this.defaultPlayerWrapper) {
      this.defaultPlayerWrapper.append(this.playerWrapper[0])
    }
  }

  removePreviousStatics() {
    this.playerWrapper.parent().find(this.className).remove()
  }

  appendStatics() {
    this.playerWrapper.parent().append(this.el)
  }

  /*
    ---------------------------------------------------------------------------
    placeholder
    ---------------------------------------------------------------------------
  */
  showPlaceholder() {
    this.$el.attr('style', this.originalStyle)
    this.$el.addClass('clappr-detach--visible')
  }

  hidePlaceholder() {
    this.$el.removeClass('clappr-detach--visible')
  }

  /*
    ---------------------------------------------------------------------------
    attach / detach
    ---------------------------------------------------------------------------
  */
  toggleDetach = () => {
    if (this.isDetached) {
      this.attach()
    } else {
      this.detach()
    }
  }

  attach = () => {
    if (!this.isDetached) {
      return
    }

    this.isDetached = false
    const isPlaying = this.currentContainer.isPlaying()
    this.disablePlayerDrag()
    this.hidePlaceholder()
    this.disableMiniPlayer()

    if (isPlaying) {
      this.currentContainer.play()
    }

    this.options.onAttach()
  }

  detach = () => {
    if (this.isDetached) {
      return
    }

    this.isDetached = true
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

  /*
    ---------------------------------------------------------------------------
    render
    ---------------------------------------------------------------------------
  */
  createPlaceholder() {
    // TODO rafael - colocar esses eventos?
    // this.$el.find('.clappr-detach__placeholder-icon').off('click', this.toggleDetach)
    // this.$el.html(placeholderMarkup(this.core.options.poster))
    // this.$el.find('.clappr-detach__placeholder-icon').on('click', this.toggleDetach)
    return placeholderMarkup(this.core.options.poster)
  }

  render() {
    const detachWrapperClassName = 'clappr-detach__wrapper'
    this.detachWrapper = $(`.${detachWrapperClassName}`)

    if (this.detachWrapper.length === 0) {
      this.detachWrapper = document.createElement('div')
      this.detachWrapper.className = detachWrapperClassName
    }

    this.$el.empty()
    this.$el.append(this.createPlaceholder())
    this.$el.append(DETACH_STYLE_TAG)
  }

  /*
    ---------------------------------------------------------------------------
    TODO
    ---------------------------------------------------------------------------
  */
}
