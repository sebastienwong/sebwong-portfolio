const URL = location.origin; // root domain

// redirects
$("#go-p0").on("click", e => {
    window.location.assign(`${URL}/p0/pages/p0.html`);
});

$("#src-p0").on("click", e => {
    window.open('https://github.com/sebastienwong/sebwong-portfolio/tree/master/public/p0');
})

$("#det-p0").on("click", e => {
    window.location.assign(`${URL}/p0/p0_visual_summary/index.html`);
});


$("#go-p1").on("click", e => {
    window.location.assign(`${URL}/p1/pages/p1.html`);
});

$("#src-p1").on("click", e => {
    window.open('https://github.com/sebastienwong/sebwong-portfolio/tree/master/public/p1');
})

$("#det-p1").on("click", e => {
    window.location.assign(`${URL}/p1/p1_visual_summary/index.html`);
});


$("#go-p2").on("click", e => {
    window.location.assign(`${URL}/p2/pages/p2.html`);
});

$("#src-p2").on("click", e => {
    window.open('https://github.com/sebastienwong/sebwong-portfolio/tree/master/public/p2');
})

$("#det-p2").on("click", e => {
    window.location.assign(`${URL}/p2/p2_visual_summary/index.html`);
});

