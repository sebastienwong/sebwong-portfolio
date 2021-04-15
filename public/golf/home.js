const URL = location.origin; // root domain

function home() {
    window.location.assign(`${URL}/#work`);
}

function go() {
    window.location.assign(`${URL}/p1/pages/p1.html`);
}