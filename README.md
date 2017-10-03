# clappr-detach-plugin

A [Clappr](https://github.com/clappr/clappr) plugin to detach the video.

![clappr-detach-plugin](https://user-images.githubusercontent.com/4842605/30820777-567d2960-a1f9-11e7-854a-32acc6cb0a47.png)

This project is a fork from https://github.com/team-767/clappr-detach-plugin. The code was simplified and we published it to npm, but the main idea remains the same.


## Installation

```shell
npm install -S clappr-detach-plugin
```

To init the plugin you have to pass it the Clappr instance, in a version compatible with 0.2.73.

```
import Clappr from 'clappr'
import initClapprDetachPlugin from 'clappr-detach-plugin'

const detachPlugin = initClapprDetachPlugin(Clappr)
```

We did it this way so the plugin will receive the dependency and doesn't have to install it.


## Usage

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
    onDetach: () => { }
    opacity: 1,
    orientation: 'bottom-right',
    width: 320,
  }
})
```

| Property            | Type          | Description                                             | valid values                                           |
| ------------------- | ------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| height              | number        | player height on detach                                 | -                                                      |
| isDetached          | bool          | whether you want to start the player detached           | -                                                      |
| onAttach            | function      | callback called when player attach on original place    | -                                                      |
| onDetach            | function      | callback called when player detach from original place  | -                                                      |
| orientation         | string        | Where the player will appear on detach                  | 'bottom-left', 'top-left', 'bottom-right', 'top-right' |
| width               | number        | player width on detach                                  | -                                                      |
