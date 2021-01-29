const URL = location.origin; // root domain

// redirects
$("#go-p0").on("click", e => {
    window.location.assign(`${URL}/pages/p0.html`);
});

$("#src-p0").on("click", e => {
    window.open('https://github.com/sebastienwong/sebwong-portfolio');
})

$("#det-p0").on("click", e => {
    window.location.assign(`${URL}/p0_visual_summary/index.html`);
});
