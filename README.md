# Warning

This plugin is being moved to https://www.npmjs.com/package/@globocom/clappr-detach-plugin

# clappr-detach-plugin

A [Clappr](https://github.com/clappr/clappr) plugin to detach the video.

![clappr-detach-plugin](https://user-images.githubusercontent.com/4842605/30820777-567d2960-a1f9-11e7-854a-32acc6cb0a47.png)

This project is a fork from https://github.com/team-767/clappr-detach-plugin. We took a different approach that was done in that project.


## Installation

```shell
npm install -S clappr-detach-plugin
```

## Usage

To init the plugin you have to pass it the Clappr object. See bellow the compatibility between this plugin and Clappr versions.

```
import Clappr from 'clappr'
import initClapprDetachPlugin from 'clappr-detach-plugin'

const detachPlugin = initClapprDetachPlugin(Clappr)
```

We did it this way so the plugin will receive the dependency and doesn't have to install it.

Full example:

```javascript
import Clappr from 'clappr'
import initClapprDetachPlugin from 'clappr-detach-plugin'

const player = new Clappr.Player({
  source: 'http://www.sample-videos.com/video/mp4/480/big_buck_bunny_480p_5mb.mp4',
  plugins: {
    'core': [initClapprDetachPlugin(Clappr)]
  }
})
```

This plugin exposes the public methods `attach` and `detach` that you can call with:

```javascript
player.getPlugin('detach').detach()
player.getPlugin('detach').attach()
```

Or using the player `configure` method:

```javascript
player.configure({ isDetached: true })
player.configure({ isDetached: false })
```


## Options

```javascript
import Clappr from 'clappr'
import initClapprDetachPlugin from 'clappr-detach-plugin'

const player = new Clappr.Player({
  source: 'http://www.sample-videos.com/video/mp4/480/big_buck_bunny_480p_5mb.mp4',
  plugins: {
    'core': [initClapprDetachPlugin(Clappr)]
  },
  // these are the default values
  detachOptions: {
    dragEnabled: true,
    height: 180,
    isDetached: false,
    onAttach: () => { },
    onDetach: () => { }
    opacity: 1,
    orientation: 'bottom-right',
    position: {
      bottom: 10,
      right: 10,
    },
    width: 320,
  }
})
```

| Property            | Type          | Description                                             | valid values                                                          |
| ------------------- | ------------- | ------------------------------------------------------- | --------------------------------------------------------------------- |
| dragEnabled         | bool          | wheter drag n drop of detached player should be enabled | -                                                                     |
| height              | number        | player height on detach                                 | -                                                                     |
| isDetached          | bool          | whether you want to start the player detached           | -                                                                     |
| onAttach            | function      | callback called when player attach on original place    | -                                                                     |
| onDetach            | function      | callback called when player detach from original place  | -                                                                     |
| orientation         | string        | Where the player will appear on detach                  | 'bottom-left', 'top-left', 'bottom-right', 'top-right'                |
| position            | object        | Force the position where player will appear on detach   | `{"top": number, "right": number, "bottom": number, "left": number}`  |
| width               | number        | player width on detach                                  | -                                                                     |


## Compatibility

This table **doesn't** mean that other versions won't work together.

It **does** means that we are sure that these versions work together.

| clappr-detach-plugin | clappr       |
| -------------------- | ------------ |
| 0.4.0                | 0.2.73       |
| 0.2.0                | 0.2.73       |
| 0.1.0                | 0.2.73       |
