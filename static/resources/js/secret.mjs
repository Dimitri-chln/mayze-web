import { getCookie } from '../../modules/cookie.mjs';


document.getElementById('claim-button').addEventListener('click', () => {
    fetch(`/api/secret?token=${getCookie('token')}`, {
        method: 'POST'
    })
        .then(res => {
            alert('La validation a bien été prise en compte');
        });
});