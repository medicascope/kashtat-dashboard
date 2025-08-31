export const requestToken = async (refresh = false) => {
    try {
        const response = await fetch('https://api.kashtat.co/v2/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                old_token: refresh ? localStorage.getItem('refresh_token') : undefined
            }),
        });
        const data = await response.json();
        if (data.token) {
            saveToken(data.token);
            return data.token;
        }
    } catch (e) {
        console.log(e);
        return null;
    }
};

export const saveToken = async (token) => {
    localStorage.setItem('token', token);
};

let retires = 0

export const getToken = async (refresh = false) => {
    try {
        let token = localStorage.getItem('token');
        if (!token || refresh) {
            console.log('No token found, requesting new token');
            token = await requestToken(refresh);
        }
        return token;
    } catch (error) {
        console.error('Error retrieving token:', error);
        return null;
    }
};

export const request = async (url, payload = {}, method = 'GET', headers) => {
    try {
        if (method.toUpperCase() === 'GET' && Object.keys(payload).length > 0) {
            const filteredPayload = Object.fromEntries(
                Object.entries(payload).filter(([_, value]) => value !== undefined)
            );

            if (Object.keys(filteredPayload).length > 0) {
                const queryParams = new URLSearchParams(filteredPayload).toString();
                url = `${url}?${queryParams}`;
            }
        }
        const token = await getToken();
        const options = {
            method: method.toUpperCase(),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...headers
            },
        };

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase()) && Object.keys(payload).length > 0) {
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);

        if (!response.ok && response.status == 401) {
            const token = await getToken(true);
            if(token){
                localStorage.setItem('token', token);
            }
            console.log(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if ((data.error == 'session_expired' || data.error == 'token_expired') && response.status == 401 && retires < 3) {
            retires++;
            console.log('Session expired, requesting new token');
            const data = await getToken(true);
            if (data) {
                return request(url, payload, method, headers);
            }
        }

        retires = 0;

        return data;

    } catch (e) {
        console.error('Error in request:', e);
        return {}
    }
};
