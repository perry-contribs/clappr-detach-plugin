var HelloWorld = Clappr.UIContainerPlugin.extend({
  name: 'hello_world',
  initialize: function() {
    this.render();
  },
  bindEvents: function() {
    this.listenTo(this.container, Clappr.Events.CONTAINER_PAUSE, this.show);
    this.listenTo(this.container, Clappr.Events.CONTAINER_PLAY, this.hide);
  },
  hide: function() {
    this.$el.hide();
  },
  show: function() {
    this.$el.show();
  },
  render: function() {
    this.$el.html('Hello World!');
    this.$el.css('font-size', '100px');
    this.$el.css('color', 'white');
    this.$el.css('background-color', 'red');
    this.$el.css('position', 'relative');
    this.container.$el.append(this.$el);
    this.hide();
    return this;
  }
});
var player = new Clappr.Player({
  source: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4",
  poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HelloWorld.svg/512px-HelloWorld.svg.png",
  parentId: "#player",
  plugins: { container: [HelloWorld] }
});
