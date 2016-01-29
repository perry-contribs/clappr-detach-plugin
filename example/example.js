var player = new Clappr.Player({
  source: "https://voddownload01.video.globo.com/v0/04/c1/f2/2143530_f20b11011d7a52b6aa38b4c6a543d0b0682adccc/2143530-web360.mp4?h=0502145408536615039439701454088966204395320711mJeq2VlTp8xq_fXSy-wRQ&k=html5",
  poster: "http://s04.video.glbimg.com/x360/2143530.jpg",
  parentId: "#player",
  plugins: {
    core: [ DetachPlugin ]
  }
});
