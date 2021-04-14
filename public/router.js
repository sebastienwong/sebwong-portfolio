const URL = location.origin; // root domain

function route(n) {
    if(n == 0) {
        window.location.assign(`${URL}/radio`);
    } else if(n == 1) {
        window.location.assign(`${URL}/golf`);
    } else if(n == 2) {
        window.location.assign(`${URL}/hallo`);
    } else {
        window.location.assign(`${URL}/`);
    }
}