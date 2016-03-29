var Drag = function (element) {
  var el = element,
    isDragReady = false,
    dragoffset = {
      x: 0,
      y: 0
    };
  this.init = function () {
    el.style.position = "fixed";
    this.events();
  };

  this.destroy = function () {
    this.unbindEvents();
  };

  //events for the element
  this.events = function () {
    var self = this;
    _on(el, 'mousedown', onMouseDown);
    _on(document, 'mouseup', onMouseUp);
    _on(document, 'mousemove', onMouseMove);
  };

  this.unbindEvents = function () {
    var self = this;
    _off(el, 'mousedown', onMouseDown);
    _off(document, 'mouseup', onMouseUp);
    _off(document, 'mousemove', onMouseMove);
  };

  var onMouseDown = function (e) {
    isDragReady = true;
    //corssbrowser mouse pointer values
    var pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ?
      document.documentElement.scrollLeft :
      document.body.scrollLeft);
    var pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ?
      document.documentElement.scrollTop :
      document.body.scrollTop);
    dragoffset.x = pageX - el.offsetLeft;
    dragoffset.y = pageY - el.offsetTop;
  }

  var onMouseUp = function () {
    isDragReady = false;
  }

  var onMouseMove = function (e) {
    if (isDragReady) {
      var pageX = e.pageX || e.clientX + (document.documentElement.scrollLeft ?
        document.documentElement.scrollLeft :
        document.body.scrollLeft);
      var pageY = e.pageY || e.clientY + (document.documentElement.scrollTop ?
        document.documentElement.scrollTop :
        document.body.scrollTop);
      el.style.top = (pageY - dragoffset.y) + "px";
      el.style.left = (pageX - dragoffset.x) + "px";
    }
  }

  //cross browser event Helper function
  var _on = function (el, event, fn) {
    document.attachEvent ? el.attachEvent('on' + event, fn) : el.addEventListener(event, fn, !0);
  };

  //cross browser event Helper function
  var _off = function (el, event, fn) {
    document.detachEvent ? el.detachEvent('on' + event, fn) : el.removeEventListener(event, fn, !0);
  };
}
module.exports = Drag;
