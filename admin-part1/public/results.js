// Shared helper functions for admin pages
async function apiCall(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        alert('Error: ' + error.message);
        throw error;
    }
}

function displayResults(data, title = 'Results', containerId = 'results') {
    const resultsDiv = document.getElementById(containerId);
    if (!resultsDiv) return;
    if (!Array.isArray(data)) {
        // Accept an object response too
        resultsDiv.innerHTML = `<h3>${title}</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
        return;
    }
    if (data.length === 0) {
        resultsDiv.innerHTML = `<h3>${title}</h3><p>No data found</p>`;
        return;
    }
    let html = `<h3>${title} (${data.length} records)</h3>`;
    html += '<table border="1" class="results-table"><thead><tr>';
    for (let key in data[0]) {
        html += `<th>${key}</th>`;
    }
    html += '</tr></thead><tbody>';
    data.forEach(row => {
        html += '<tr>';
        for (let key in row) {
            html += `<td>${row[key] ?? ''}</td>`;
        }
        html += '</tr>';
    });
    html += '</tbody></table>';
    resultsDiv.innerHTML = html;
}

// Use these helpers in other pages by including results.js
