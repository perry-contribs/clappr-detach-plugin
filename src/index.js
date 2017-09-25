/* eslint-disable import/extensions, import/no-unresolved */
import { UICorePlugin, Events, Styler, template } from 'clappr'
import $ from 'clappr-zepto/zepto'
/* eslint-enable import/extensions, import/no-unresolved */

import setupInteractions from './interactions'

// assets
import detachIcon from './assets/detach-icon.svg'
import detachPlaceholder from './assets/detach-placeholder.html'
import detachToggle from './assets/detach-toggle.html'
import detachStyle from './assets/detach.css'

const NOOP = () => {}

const DETACH_STYLE_TAG = Styler.getStyleFor(detachStyle)

const DEFAULT_POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const DEFAULT_OPTIONS = {
  orientation: 'bottom-right',
  opacity: 1,
  width: 320,
  height: 180,
  detachOnStart: false,
  onAttach: NOOP,
  onDetach: NOOP,
}

const DETACH_ICON_SVG = template(detachIcon)()

const DETACH_TOGGLE_HTML = template(detachToggle)({
  icon: DETACH_ICON_SVG,
})

const PLAYER_DETACHED_STYLE = {
  height: '100%',
  width: '100%',
}

const placeholderMarkup = (poster = DEFAULT_POSTER) => template(detachPlaceholder)({
  icon: DETACH_ICON_SVG,
  backgroundImage: poster,
})

const orientationOptions = (orientation) => {
  const options = {}

  orientation.split('-').forEach((side) => {
    if (side === 'left') { options.left = 10 }
    if (side === 'right') { options.right = 10 }
    if (side === 'bottom') { options.bottom = 10 }
    if (side === 'top') { options.top = 10 }
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

  // clappr uses this - to expose like player.getPlugin('detach').detach()
  getExternalInterface() {
    return {
      attach: this.attach,
      detach: this.detach,
    }
  }

  get currentContainer() { return this.core.getCurrentContainer() }

  constructor(core) {
    super(core)

    this.mergeOptions(this.core.options.detachOptions)

    if (core.ready) {
      this.onCoreReady()
    }
  }

  /*
    ---------------------------------------------------------------------------
    options
    ---------------------------------------------------------------------------
  */
  mergeOptions(customOptions) {
    this.mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...customOptions,
    }
  }

  get options() {
    return this.mergedOptions
  }

  onOptionsChange() {
    this.initElements()
  }

  /*
    ---------------------------------------------------------------------------
    elements
    ---------------------------------------------------------------------------
  */
  /*
    initialize references to some elements that later we will use a lot
  */
  initElements() {
    this.initMiniPlayerContainerElement()
    this.initMainPlayerContainerElement()
    this.initMainPlayerContainerPlaceholderElement()
  }

  /*
    $player is the player itself, that gets moved between the $mainPlayerContainer and $miniPlayerContainer.
    We don't instantiate $player, Clappr does
  */
  get $player() { return this.core.$el }

  /*
    $miniPlayerContainer is the element we move the $player to when it is detached
  */
  initMiniPlayerContainerElement() {
    if (this.$miniPlayerContainer) {
      return
    }

    const el = $('<div>')
    el.addClass('clappr-detach__wrapper')
    $('body').append(el)

    this.$miniPlayerContainer = el
    this.$miniPlayerContainer.css(this.miniPlayerOptions)
  }

  /*
    $mainPlayerContainer is the element where the $player was originaly put in.
    When we attach back the player, we move it to $mainPlayerContainer
  */
  initMainPlayerContainerElement() {
    // When $player is mounted in the DOM (after Events.CORE_READY), we keep a reference to the parent.
    // Since $player may be removed later, it may not have a parent later, so we keep the reference.
    if (this.$mainPlayerContainer || !this.$player.parent()[0]) {
      return
    }

    this.$mainPlayerContainer = this.$player.parent()
  }

  /*
    $mainPlayerPlaceholder is the element we put a placeholder in when we detach the player to the $miniPlayerContainer
  */
  get $mainPlayerPlaceholder() { return this.$el }

  initMainPlayerContainerPlaceholderElement() {
    this.$mainPlayerPlaceholder.empty()
    this.$mainPlayerPlaceholder.append(placeholderMarkup(this.core.options.poster))
    this.$mainPlayerPlaceholder.append(DETACH_STYLE_TAG)
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
    this.$mainPlayerContainer.find(this.className).remove()
    this.$mainPlayerContainer.append(this.$mainPlayerPlaceholder[0])

    // save mainPlayer original styles to reset back to it when needed
    this.playerOriginalStyle = this.$player.attr('style')

    // set the mainPlayerPlaceholder styles based on the mainPlayer styles
    this.$mainPlayerPlaceholder.attr('style', this.playerOriginalStyle)
  }

  onContainerPlay() {
    if (!this.alreadyDetachedOnStart && this.options.detachOnStart) {
      this.alreadyDetachedOnStart = true
      this.detach()
    }
  }

  /*
    ---------------------------------------------------------------------------
    fullscreen
    ---------------------------------------------------------------------------
  */
  onCoreFullScreen(goingToFullScreen) {
    this.mediaControlDetachToggle.toggle(!goingToFullScreen)

    if (goingToFullScreen) {
      return
    }

    // the timeout is needed to delay the execution until the fullscreen has finished quiting
    setTimeout(() => {
      this.updatePlayer(this.isDetached)
    })
  }

  /*
    ---------------------------------------------------------------------------
    media control
    ---------------------------------------------------------------------------
  */
  get clickToPausePlugin() { return this.core.containers[0].getPlugin('click_to_pause') }
  get mediaControl() { return this.core.mediaControl }
  get mediaControlDetachToggle() { return this.mediaControl.$el.find('[data-js="clappr-detach__detach-toggle"]') }
  get mediaControlRightPanel() { return this.mediaControl.$el.find('.media-control-right-panel') }
  get mediaControlSeekBar() { return this.mediaControl.$el.find('.media-control-center-panel') }

  /*
    adds the toggle detach button to the media control
  */
  onMediaControlRendered() {
    this.mediaControl.setKeepVisible(true)
    this.mediaControlRightPanel.append(DETACH_TOGGLE_HTML)
    this.mediaControlDetachToggle.on('click', () => this.toggleDetach(!this.isDetached))
  }

  /*
    ---------------------------------------------------------------------------
    player
    ---------------------------------------------------------------------------
  */
  updatePlayer(isDetached) {
    if (isDetached) {
      this.$player.css(PLAYER_DETACHED_STYLE)
    } else {
      this.$player.attr('style', this.playerOriginalStyle)
    }
  }

  /*
    ---------------------------------------------------------------------------
    main player container
    ---------------------------------------------------------------------------
  */
  movePlayerToMainPlayer() {
    this.$mainPlayerContainer.append(this.$player[0])
  }

  updateMainPlayer(isDetached) {
    this.mediaControlSeekBar.toggle(!isDetached)
    this.$mainPlayerPlaceholder.toggleClass('clappr-detach--visible', isDetached)
  }

  /*
    ---------------------------------------------------------------------------
    mini player container
    ---------------------------------------------------------------------------
  */
  get miniPlayerOptions() {
    const { orientation, ...options } = this.options
    return { ...options, ...orientationOptions(orientation) }
  }

  movePlayerToMiniPlayer() {
    this.$miniPlayerContainer.append(this.$player[0])
  }

  updateMiniPlayer(isDetached) {
    this.$miniPlayerContainer.css({
      transform: 'translate(0, 0)',
    })

    this.$miniPlayerContainer.toggle(isDetached)

    if (isDetached) {
      setupInteractions(this.$miniPlayerContainer[0], {
        drag: true,
        drop: {
          dropAreaElement: this.$mainPlayerPlaceholder[0],
          onDrop: this.attach,
        },
      })
    }
  }

  /*
    ---------------------------------------------------------------------------
    attach / detach
    ---------------------------------------------------------------------------
  */
  toggleDetach = (isDetached) => {
    this.isDetached = isDetached
    const isPlaying = this.currentContainer.isPlaying()

    this.updateMiniPlayer(isDetached)
    this.updateMainPlayer(isDetached)
    this.updatePlayer(isDetached)

    if (isDetached) {
      this.movePlayerToMiniPlayer()
      this.clickToPausePlugin.disable()
      this.options.onDetach()
    } else {
      this.movePlayerToMainPlayer()
      this.clickToPausePlugin.enable()
      this.options.onAttach()
    }

    // when the player is moved while playing, it becomes paused. So we restore the playing
    if (isPlaying) {
      this.currentContainer.play()
    }
  }

  attach = () => {
    if (!this.isDetached) {
      return
    }
    this.toggleDetach(false)
  }

  detach = () => {
    if (this.isDetached) {
      return
    }
    this.toggleDetach(true)
  }
}
