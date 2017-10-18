# clappr-detach-plugin

A [Clappr](https://github.com/clappr/clappr) plugin to detach the video.

![clappr-detach-plugin](https://user-images.githubusercontent.com/4842605/30820777-567d2960-a1f9-11e7-854a-32acc6cb0a47.png)

This project is a fork from https://github.com/team-767/clappr-detach-plugin. The code was simplified and we published it to npm, but the main idea remains the same.


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
    height: 180,
    isDetached: false,
    onAttach: () => { },
    onClose: player.getPlugin('detach').attach(),
    onDetach: () => { },
    opacity: 1,
    orientation: 'bottom-right',
    position: {
      bottom: 10,
      right: 10,
    },
    showClose: true,
    width: 320,
  }
})
```

| Property            | Type          | Description                                             | valid values                                                                                         |
| ------------------- | ------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| height              | number        | player height on detach                                 | -                                                                                                    |
| isDetached          | bool          | whether you want to start the player detached           | -                                                                                                    |
| onAttach            | function      | callback called when player attach on original place    | -                                                                                                    |
| onClose             | function      | callback called when user clicks on close icon ("X")    | -                                                                                                    |
| onDetach            | function      | callback called when player detach from original place  | -                                                                                                    |
| orientation         | string        | Where the player will appear on detach                  | 'bottom-left', 'top-left', 'bottom-right', 'top-right'                                               |
| position            | object        | Force the position where player will appear on detach   | `{"top": number, "right": number, "bottom": number, "left": number}`                                 |
| showClose           | bool          | whether to show close icon                              | -                                                                                                    |
| width               | number        | player width on detach                                  | -                                                                                                    |


## Compatibility

This table **doesn't** mean that other versions won't work together.

It **does** means that we are sure that these versions work together.

| clappr | detachPlugin |
| --- | --- |
| 0.2.73 | 0.1.0 |
