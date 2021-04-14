const URL = location.origin; // root domain

function home() {
    window.location.assign(`${URL}/`);
}

function go() {
    window.location.assign(`${URL}/p2/pages/p2.html`);
}