// API
function getJSON(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            return data;
        })
        .catch(error => {
            console.error("Error:", error);
            throw error;
        });
}

function writeJSON(path, data) {
    const body = typeof data === 'string' ? data : JSON.stringify(data);

    return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP-Error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(result => {
            return result;
        })
        .catch(error => {
            console.error("Error:", error);
            throw error;
        });
}
