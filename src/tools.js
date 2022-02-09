/* eslint no-useless-escape: "off" */

import router from './router';

function getCookie(name) {
    const matches = document.cookie.match(new RegExp(
        '(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options = {}) {
    options = {
        path: '/',
        ...options,
    };

    if (options.expires instanceof Date) {
        options.expires = options.expires.toUTCString();
    }

    let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

    Object.keys(options).forEach(optionKey => {
        updatedCookie += '; ' + optionKey;
        const optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += '=' + optionValue;
        }
    });

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, '', {
        'max-age': -1,
    });
}

const delay = ms => {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
};

async function send(params) {
    const { domain = 'http://localhost:5000', uri, reqType, payload, resType = 'json', wait = false } = params;

    let body = {};

    switch (reqType) {
        case 'get':
            body = {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${getCookie('token')}`,
                },
            };
            break;
        case 'post':
            body = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`,
                },
                body: JSON.stringify(payload),
            };
            break;
        case 'put':
            body = {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`,
                },
                body: JSON.stringify(payload),
            };
            break;
        case 'delete':
            body = {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('token')}`,
                },
            };
            break;
        case 'file':
            body = {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${getCookie('token')}`,
                },
                contentType: 'multipart/form-data',
                body: payload,
            };
            break;
    }

    if (wait) {
        await delay(1000);
    }

    const res = await fetch(`${domain}/${uri}`, body);

    if (res.ok) {
        const response = resType === 'json' ? await res.json() : res;

        return response;
    }

    Promise.reject(res);

    switch (res.status) {
        case 401:
            // localStorage.removeItem('token');
            // location.reload();
            break;
        case 500:
            router.push({ path: '/error', params: { errorCode: res.status, errorAbout: res.statusText } });
            break;
        default:
            return resType === 'json' ? await res.json() : res;
    }
}

async function modalStatus(status, method) {
    return new Promise((resolve, reject) => {
        if (status === true) { resolve(console.log('ok')); } else { reject(console.log('bad')); };
    });
}

function timestampToDate(date, type = 'full') {
    const resDate = new Date(date).getTime();
    const d = new Date();

    d.setTime(resDate);
    switch (type) {
        case 'full': return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
        case 'justDate': return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
        case 'justTime': return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
}

export { send, modalStatus, timestampToDate, getCookie, setCookie, deleteCookie, delay };
