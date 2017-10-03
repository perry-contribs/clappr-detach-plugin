/* eslint-disable import/extensions, import/no-unresolved */
import { UICorePlugin, Events, Styler, template } from 'clappr'
/* eslint-enable import/extensions, import/no-unresolved */

import assign from 'lodash.assign'
import setupInteractions from './interactions'

// assets
import detachIcon from './assets/detach-icon.svg'
import detachPlaceholder from './assets/detach-placeholder.html'
import detachToggle from './assets/detach-toggle.html'
import detachStyle from './assets/detach.css'

const toggleElement = (element, show) => {
  if (show) {
    element.style.display = '' // eslint-disable-line no-param-reassign
  } else {
    element.style.display = 'none' // eslint-disable-line no-param-reassign
  }
}

const NOOP = () => {}

const DETACH_STYLE_TAG = Styler.getStyleFor(detachStyle)

const DEFAULT_POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const DEFAULT_OPTIONS = {
  isDetached: false,
  orientation: 'bottom-right',
  opacity: 1,
  width: 320,
  height: 180,
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

    if (core.ready) {
      this.onCoreReady()
    }
  }

  /*
    ---------------------------------------------------------------------------
    options
    ---------------------------------------------------------------------------
  */
  getOptions() {
    return {
      ...DEFAULT_OPTIONS,
      ...this.core.options.detachOptions,
    }
  }

  setOptions(options) {
    assign(this.core.options.detachOptions, options)
  }

  // when this function is called, `this.core.options.detachOptions` was already changed by clappr,
  // so we can use the new value
  onOptionsChange() {
    this.toggleDetach(this.core.options.isDetached)
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
    (jQuery element) $player is the player itself, that gets moved between the
    $mainPlayerContainer and $miniPlayerContainer. We don't instantiate $player, Clappr does
  */
  get $player() { return this.core.$el }

  /*
    (DOM node) $miniPlayerContainer is the element we move the $player to when it is detached.
    This is not a jQuery element because we create it ourselves, and we don't want to have jQuery as dependency.
  */
  initMiniPlayerContainerElement() {
    if (this.$miniPlayerContainer) {
      return
    }

    this.$miniPlayerContainer = document.createElement('div')
    this.$miniPlayerContainer.classList.add('clappr-detach__wrapper')
    document.body.append(this.$miniPlayerContainer)

    const options = this.miniPlayerOptions
    this.$miniPlayerContainer.style.opacity = `${options.opacity}`
    this.$miniPlayerContainer.style.height = `${options.height}px`
    this.$miniPlayerContainer.style.width = `${options.width}px`
    this.$miniPlayerContainer.style.left = `${options.left}px`
    this.$miniPlayerContainer.style.right = `${options.right}px`
    this.$miniPlayerContainer.style.top = `${options.top}px`
    this.$miniPlayerContainer.style.bottom = `${options.bottom}px`
  }

  /*
    (jQuery element) $mainPlayerContainer is the element where the $player was originaly put in.
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
    (jQuery element) $mainPlayerPlaceholder is the element we put a placeholder in when
    we detach the player to the $miniPlayerContainer
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

    // clean up any element that might conflict with the placeholder
    this.$mainPlayerContainer.find(this.className).remove()
    this.$mainPlayerContainer.append(this.$mainPlayerPlaceholder[0])

    // save mainPlayer original styles to reset back to it when needed
    this.playerOriginalStyle = this.$player.attr('style')

    // set the mainPlayerPlaceholder styles based on the mainPlayer styles
    this.$mainPlayerPlaceholder.attr('style', this.playerOriginalStyle)

    if (this.getOptions().isDetached) {
      this.toggleDetach(true)
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
      this.updatePlayer(this.getOptions().isDetached)
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
    this.mediaControlDetachToggle.on('click', () => {
      this.toggleDetach(!this.getOptions().isDetached)
    })
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
    const { orientation, ...options } = this.getOptions()
    return { ...options, ...orientationOptions(orientation) }
  }

  movePlayerToMiniPlayer() {
    this.$miniPlayerContainer.append(this.$player[0])
  }

  updateMiniPlayer(isDetached) {
    this.$miniPlayerContainer.style.transform = 'translate(0, 0)'
    toggleElement(this.$miniPlayerContainer, isDetached)

    if (isDetached) {
      setupInteractions(this.$miniPlayerContainer, {
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
    this.setOptions({
      isDetached,
    })
    const isPlaying = this.currentContainer.isPlaying()

    this.updatePlayer(isDetached)
    this.updateMiniPlayer(isDetached)
    this.updateMainPlayer(isDetached)

    if (isDetached) {
      this.movePlayerToMiniPlayer()
      this.clickToPausePlugin.disable()
      this.getOptions().onDetach()
    } else {
      this.movePlayerToMainPlayer()
      this.clickToPausePlugin.enable()
      this.getOptions().onAttach()
    }

    // when the player is moved while playing, it becomes paused. So we restore the playing
    if (isPlaying) {
      this.currentContainer.play()
    }
  }

  attach = () => {
    if (!this.getOptions().isDetached) {
      return
    }
    this.toggleDetach(false)
  }

  detach = () => {
    if (this.getOptions().isDetached) {
      return
    }
    this.toggleDetach(true)
  }
}
