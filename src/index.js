/* eslint-disable import/extensions, import/no-unresolved */
import { UICorePlugin, Events, Styler, template } from 'clappr'
import $ from 'clappr-zepto/zepto'
/* eslint-enable import/extensions, import/no-unresolved */

import setupInteractions from './interactions'

// assets
import DetachMediaControlButton from './assets/detach-media-control-button.html'
import DetachPlaceholder from './assets/detach-placeholder.html'
import DetachIcon from './assets/detach-icon.svg'
import DetachStyle from './assets/detach.scss'

const DETACH_STYLE_TAG = Styler.getStyleFor(DetachStyle)

const DEFAULT_POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const NOOP = () => {}

const DEFAULT_OPTIONS = {
  orientation: 'bottom-left',
  opacity: 1,
  width: 320,
  height: 180,
  detachOnStart: true, // TODO set false when done
  onAttach: NOOP,
  onDetach: NOOP,
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
    elements
    ---------------------------------------------------------------------------
  */
  get $player() { return this.core.$el }
  get $playerPlaceholder() { return this.$el }

  initElements() {
    this.initMiniPlayerParentElement()
    this.initMainPlayerParentElement()
  }

  initMiniPlayerParentElement() {
    if (this.$miniPlayerParent) {
      return
    }

    const el = $('<div>')
    el.addClass('clappr-detach__wrapper')
    $('body').append(el)

    this.$miniPlayerParent = el
  }

  initMainPlayerParentElement() {
    // When $player is mounted in the DOM (after Events.CORE_READY), we keep a reference to the parent.
    // Since $player may be removed later, it may not have a parent later, so we keep the reference.
    if (this.$mainPlayerParent || !this.$player.parent()[0]) {
      return
    }

    this.$mainPlayerParent = this.$player.parent()
  }

  /*
    ---------------------------------------------------------------------------
    wrapper
    ---------------------------------------------------------------------------
  */
  moveToMiniPlayerParent = () => {
    this.$miniPlayerParent.append(this.$player[0])
  }

  moveToMainPlayerParent = () => {
    this.$mainPlayerParent.append(this.$player[0])
  }

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
    this.initElements()
    this.listenTo(this.currentContainer, Events.CONTAINER_PLAY, this.onContainerPlay)

    // clean up any element that might conflict with the placeholder
    this.$mainPlayerParent.find(this.className).remove()
    this.$mainPlayerParent.append(this.$playerPlaceholder[0])
  }

  onContainerPlay() {
    if (!this.alreadyDetachedOnStart && this.options.detachOnStart) {
      this.alreadyDetachedOnStart = true
      this.detach()
    }
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
  onCoreFullScreen(goingToFullScreen) {
    this.mediaControlDetachButton.toggle(!goingToFullScreen)

    if (!goingToFullScreen) {
      if (this.isDetached) {
        // FIXME
        setTimeout(() => {
          this.core.resize({
            width: this.options.width,
            height: this.options.height,
          })
        }, 10)
      } else {
        this.$player.attr('style', this.mainPlayerOriginalStyle)
      }
    }
  }

  /*
    ---------------------------------------------------------------------------
    media control
    ---------------------------------------------------------------------------
  */
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }
  get mediaControl() { return this.core.mediaControl }
  get mediaControlDetachButton() { return this.mediaControl.$el.find('.clappr-detach__media-control-button') }
  get mediaControlRightPanel() { return this.mediaControl.$el.find('.media-control-right-panel') }
  get mediaControlSeekBar() { return this.mediaControl.$el.find('.media-control-center-panel') }

  onMediaControlRendered() {
    this.mediaControl.setKeepVisible(true)
    this.mediaControlRightPanel.append(mediaControlButtonMarkup)
    this.mediaControlDetachButton.on('click', this.toggleDetach)
  }

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
    this.$player.css({
      opacity: 0,
    })
  }

  showPlayer() {
    this.$player.css({
      height: '100%',
      width: '100%',
      opacity: 1,
    })
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
    this.mediaControlSeekBar.hide()
    this.moveToMiniPlayerParent()

    this.showPlayer()
    this.$miniPlayerParent.css(this.miniPlayerOptions)
    this.resetMiniPlayerPosition()
    // FIXME
    setTimeout(() => {
      this.$miniPlayerParent.css(orientationOptions(this.options.orientation))
    }, 10)
  }

  disableMiniPlayer() {
    this.mediaControlSeekBar.show()
    this.moveToMainPlayerParent()
    this.resetMiniPlayerPosition()
    this.$player.attr('style', this.mainPlayerOriginalStyle)
  }

  resetMiniPlayerPosition() {
    this.$miniPlayerParent.css({
      transform: 'translate(0, 0)',
    })
  }

  /*
    ---------------------------------------------------------------------------
    drag
    ---------------------------------------------------------------------------
  */
  enablePlayerDrag() {
    this.disablePauseClick()
    setupInteractions(this.$miniPlayerParent[0], {
      drag: true,
      drop: {
        dropAreaElement: this.$playerPlaceholder[0],
        onDrop: this.attach,
      },
    })
  }

  disablePlayerDrag() {
    this.enablePauseClick()
  }

  /*
    ---------------------------------------------------------------------------
    placeholder
    ---------------------------------------------------------------------------
  */
  showPlaceholder() {
    this.$playerPlaceholder.attr('style', this.mainPlayerOriginalStyle)
    this.$playerPlaceholder.addClass('clappr-detach--visible')
  }

  hidePlaceholder() {
    this.$playerPlaceholder.removeClass('clappr-detach--visible')
  }

  /*
    ---------------------------------------------------------------------------
    attach / detach
    ---------------------------------------------------------------------------
  */
  // clappr uses this
  getExternalInterface() {
    return {
      detach: this.detach,
      attach: this.attach,
    }
  }

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

    this.mainPlayerOriginalStyle = this.$player.attr('style')

    this.hidePlayer()
    this.enablePlayerDrag()
    this.enableMiniPlayer()
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
    // this.$playerPlaceholder.find('.clappr-detach__placeholder-icon').off('click', this.toggleDetach)
    // this.$playerPlaceholder.html(placeholderMarkup(this.core.options.poster))
    // this.$playerPlaceholder.find('.clappr-detach__placeholder-icon').on('click', this.toggleDetach)
    return placeholderMarkup(this.core.options.poster)
  }

  render() {
    this.initElements()


    console.log('####### this.$playerPlaceholder', this.$playerPlaceholder)

    this.$playerPlaceholder.empty()
    this.$playerPlaceholder.append(this.createPlaceholder())
    this.$playerPlaceholder.append(DETACH_STYLE_TAG)
  }
}
