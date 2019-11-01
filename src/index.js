import assign from 'lodash.assign'

import setupInteractions from './interactions'
import { addDragArea, removeDragArea } from './drag'

// assets
import detachIcon from './assets/detach-icon.svg'
import detachPlaceholder from './assets/detach-placeholder.html'
import detachToggle from './assets/detach-toggle.html'
import detachStyle from './assets/detach.css'

let dragInteractable

const NOOP = () => {}

const DEFAULT_POSITION = 10

const DEFAULT_POSTER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs='

const DEFAULT_OPTIONS = {
  dragEnabled: true,
  isDetached: false,
  orientation: 'bottom-right',
  position: {
    bottom: DEFAULT_POSITION,
    right: DEFAULT_POSITION,
  },
  opacity: 1,
  width: 320,
  height: 180,
  onAttach: NOOP,
  onDetach: NOOP,
}

const orientationOptions = (orientation, position) => {
  const options = {}

  orientation.split('-').forEach((side) => {
    if (side === 'left') { options.left = position.left || DEFAULT_POSITION }
    if (side === 'right') { options.right = position.right || DEFAULT_POSITION }
    if (side === 'bottom') { options.bottom = position.bottom || DEFAULT_POSITION }
    if (side === 'top') { options.top = position.top || DEFAULT_POSITION }
  })

  return options
}

const initPlugin = ({
  UICorePlugin,
  Events,
  Styler,
  template,
}) => {
  const DETACH_STYLE_TAG = Styler.getStyleFor(detachStyle)

  const DETACH_ICON_SVG = template(detachIcon)()

  const DETACH_TOGGLE_HTML = template(detachToggle)({
    icon: DETACH_ICON_SVG,
  })

  const placeholderMarkup = (poster = DEFAULT_POSTER) => template(detachPlaceholder)({
    icon: DETACH_ICON_SVG,
    backgroundImage: poster,
  })

  return class ClapprDetachPlugin extends UICorePlugin {
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
    // we have to verify the core first to not apply changes before the right moment
    onOptionsChange() {
      if (this.core.ready) { this.toggleDetach(this.core.options.isDetached) }
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
      this.initPlayerContainerPlaceholderElement()
    }

    /*
      (jQuery element) $player is the player element itself. We don't instantiate $player, Clappr does
    */
    get $player() { return this.core.$el }

    /*
      (jQuery element) $playerContainer is the element where the $player is attached to when created
    */
    get $playerContainer() { return this.$player.parent() }

    /*
      (jQuery element) $playerPlaceholder is the element we put a placeholder in when we detach the player
    */
    get $playerPlaceholder() { return this.$el }

    initPlayerContainerPlaceholderElement() {
      this.$playerPlaceholder.empty()
      this.$playerPlaceholder.append(placeholderMarkup(this.core.options.poster))
      this.$playerPlaceholder.append(DETACH_STYLE_TAG)
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
      this.$playerContainer.find(this.className).remove()
      const elementDetach = this.$playerPlaceholder.detach()
      elementDetach.appendTo(this.$playerContainer)

      // save player original styles to reset back to it when needed
      this.playerOriginalStyle = this.$player.attr('style')

      // set the playerPlaceholder styles based on the player styles
      this.$playerPlaceholder.attr('style', this.playerOriginalStyle)

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
      if (this.mediaControl.setKeepVisible) {
        this.mediaControl.setKeepVisible(true)
      }
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
      this.mediaControlSeekBar.toggle(!isDetached)
      this.$playerPlaceholder.toggleClass('clappr-detach--visible', isDetached)
      this.$player.toggleClass('clappr-detach--is-detached', isDetached)
      this.$player[0].style.transform = 'translate(0, 0)'

      const options = this.detachedOptions
      if (isDetached) {
        this.$player[0].style.opacity = `${options.opacity}`
        this.$player[0].style.left = `${options.left}px`
        this.$player[0].style.right = `${options.right}px`
        this.$player[0].style.top = `${options.top}px`
        this.$player[0].style.bottom = `${options.bottom}px`
        this.$player[0].style.setProperty('width', `${options.width}px`, 'important')
        this.$player[0].style.setProperty('height', `${options.height}px`, 'important')

        if (options.dragEnabled) {
          const result = setupInteractions(this.$player[0], {
            drag: {
              dragArea: addDragArea(),
            },
            drop: {
              dropAreaElement: this.$playerPlaceholder[0],
              onDrop: this.attach,
            },
          })

          dragInteractable = result.drag
        }
      } else {
        this.$player.attr('style', this.playerOriginalStyle)
        if (options.dragEnabled) {
          removeDragArea()
          if (dragInteractable) {
            dragInteractable.unset()
          }
        }
      }
    }

    /*
      ---------------------------------------------------------------------------
      detached
      ---------------------------------------------------------------------------
    */
    get detachedOptions() {
      const { orientation, position, ...options } = this.getOptions()
      return { ...options, ...orientationOptions(orientation, position) }
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

      if (isDetached) {
        this.clickToPausePlugin.disable()
        this.getOptions().onDetach()
      } else {
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
}

export default initPlugin
