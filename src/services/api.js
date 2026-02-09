// Configuration
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const INSTANCE_ID = import.meta.env.VITE_INSTANCE_ID;
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

// Helper to construct the specific URL with Query Params
const getUrl = (operation, id = null) => {
    let path = `/${operation}/seitb`;
    if (id) path += `/${id}`;
    return `${API_BASE}${path}?Instance=${INSTANCE_ID}`;
};

// Helper to handle the Fetch API calls standardly
const request = async (url, method = 'GET', body = null) => {
    const headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
    };

    if (API_TOKEN) {
        headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    // Handle cases where DELETE might not return JSON
    if (method === 'DELETE') return true;

    return await response.json();
};

export const api = {
    // GET /read/seitb
    getAll: async () => {
        const url = getUrl('read');
        const data = await request(url);
        // Normalize data: ensure we always return an array
        return Array.isArray(data) ? data : (data.data || []);
    },

    // POST /create/seitb
    create: async (productData) => {
        const url = getUrl('create');
        const payload = {
            ...productData,
            pp: "product" // Enforce requirement here
        };
        return await request(url, 'POST', payload);
    },

    // PUT /update/seitb/{id}
    update: async (id, productData) => {
        const url = getUrl('update', id);
        const payload = {
            ...productData,
            pp: "product" // Maintain consistency
        };
        return await request(url, 'PUT', payload);
    },

    // DELETE /delete/seitb/{id}
    remove: async (id) => {
        const url = getUrl('delete', id);
        return await request(url, 'DELETE');
    }
};