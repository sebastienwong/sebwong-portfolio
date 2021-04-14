$(function() {
    var controller = new ScrollMagic.Controller();

    new ScrollMagic.Scene({
        triggerElement: '#header',
        triggerHook: 'onLeave'
    })
    .setPin('#header')
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);
});