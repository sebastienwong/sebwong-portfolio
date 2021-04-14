$(function() {
    var controller = new ScrollMagic.Controller();

    // get all slides
    var slides = document.querySelectorAll("section.panel");
    var slide_scenes = [];

    // create scene for every slide
    for (var i=0; i<slides.length; i++) {
        var slide_scene = new ScrollMagic.Scene({
            triggerElement: slides[i],
            triggerHook: 'onLeave'
        })
        .setPin(slides[i], {pushFollowers: false})
        .addIndicators() // add indicators (requires plugin)
        .addTo(controller);

        slide_scenes.push(slide_scene);
    }

    var about_timeline = new TimelineMax();
    var dec_tween = TweenMax.to("#about-dec", 1, {opacity: 1});
    var about_tween = TweenMax.to("#about-info", 1, {opacity: 1});
    about_timeline.add([
        dec_tween,
        about_tween
    ]);

    new ScrollMagic.Scene({
        triggerElement: slides[1],
        duration: '75%'
    })
    .setTween(about_timeline)
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);


    var work_timeline = new TimelineMax();
    var gallery_tween = TweenMax.to("#gallery", 1, {opacity: 1});
    var work_tween = TweenMax.to("#work-info", 1, {opacity: 1});
    work_timeline.add([
        gallery_tween,
        work_tween
    ]);

    new ScrollMagic.Scene({
        triggerElement: slides[2],
        duration: '75%'
    })
    .setTween(work_timeline)
    .addIndicators() // add indicators (requires plugin)
    .addTo(controller);

    //slide_scenes[1].setTween("#about-dec", {opacity: 1});
});