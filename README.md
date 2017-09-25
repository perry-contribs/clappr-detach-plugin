# clappr-detach-plugin

A clappr plugin to detach video from screen



## Installing
  TODO

## Usage
``` javascript
import ClapprDetachPlugin from 'clappr-detach-plugin'

const player = new Clappr.Player({
  source: 'http://www.sample-videos.com/video/mp4/480/big_buck_bunny_480p_5mb.mp4',

  plugins: {
    'core': [ClapprDetachPlugin]
  }
})
```

You can also configure plugin behavior using `detachOptions` with following options

|    Property    | Type |          Description          | values | default |
| -------------  | ---- |          -----------          | ------ | ------- |
| orientation    | string | It's where player will appear on detach | 'bottom-left', 'top-left', 'bottom-right', 'top-right' | 'bottom-left' |
| detachOnStart | bool | automatically detach when player starts to play | true, false | true |
| width | number | player width on detach | Any integer value | 320 |
| height | number | player height on detach | Any integer value | 180 |
| onDetach | function | callback called when player detach from original place | function | noop |
| onAttach | function | callback called when player attach on original place | function | noop |

``` javascript
import ClapprDetachPlugin from 'clappr-detach-plugin'

const player = new Clappr.Player({
  source: 'http://www.sample-videos.com/video/mp4/480/big_buck_bunny_480p_5mb.mp4',

  plugins: {
    'core': [ClapprDetachPlugin]
  },
  detachOptions: {
    orientation: 'bottom-right',
    width: 320,
    height: 180,
    detachOnStart: true,
    onAttach: () => { console.log('Attached!') },
    onDetach: () => { console.log('Detached!') }
  }
})

player.getPlugin('detach').detach()
```
