
const goingBtn = document.getElementById('yes');
const notGoingBtn = document.getElementById('no');
const selectEl = document.querySelector('select');

function handleClick(e) {
    if (e.target.id === goingBtn.id) {
        // change class of both elements
        e.target.classList.add('clicked');
        notGoingBtn.classList.remove('clicked');
        // change the disable attribute on the <select>
        selectEl.removeAttribute('disabled');
    } else {
        e.target.classList.add('clicked');
        goingBtn.classList.remove('clicked');
        // change the disable attribute on the <select>
        selectEl.setAttribute('disabled', 'true');
    }
}

goingBtn.addEventListener('click', handleClick, true);
notGoingBtn.addEventListener('click', handleClick, true);