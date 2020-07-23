# clappr-detach-plugin-example

An example project for [clappr-detach-plugin](https://github.com/globocom/clappr-detach-plugin)

## install and run

```
yarn
yarn start
```

or

```
npm install
npm start
```

## development mode

If you want to develop `clappr-detach-plugin` on your machine and test your changes on this example, open 2 terminals and run:

- on `clappr-detach-plugin` folder:

  ```
  yarn link
  yarn watch
  ```

- on `clappr-detach-plugin/example` folder:

  ```
  yarn link clappr-detach-plugin
  yarn start
  ```

  and open http://localhost:3000/
