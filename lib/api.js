const API_URL = "/api";

export const login = async (user) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });
    return res.json();
};

export const generateDemoQuote = async (text) => {
    const res = await fetch(`${API_URL}/quote/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(errorData.error || 'Error generando cotización demo');
    }
    return res.json();
};

export const generateQuote = async (text, companyId) => {
    const res = await fetch(`${API_URL}/quote/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, companyId })
    });

    if (res.status === 403) {
        const err = await res.json();
        throw { code: 'LIMIT_REACHED', message: err.message };
    }

    if (!res.ok) throw new Error("Error generating quote");
    return res.json();
};

export const getMaterials = async (companyId) => {
    const res = await fetch(`${API_URL}/materials/${companyId}`);
    return res.json();
};

export const addMaterial = async (material, companyId) => {
    const res = await fetch(`${API_URL}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...material, companyId })
    });
    return res.json();
};

export const updateMaterial = async (id, material) => {
    const res = await fetch(`${API_URL}/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(material)
    });
    return res.json();
};

export const updateCompany = async (id, data) => {
    const res = await fetch(`${API_URL}/company/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const upgradeSubscription = async (companyId) => {
    const res = await fetch(`${API_URL}/subscription/upgrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId })
    });
    return res.json();
};

export const createCheckoutSession = async (companyId, email) => {
    const res = await fetch(`${API_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, email })
    });
    return res.json();
};

export const getOrCreateCompany = async (userId) => {
    const res = await fetch(`${API_URL}/user/company?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch company");
    return res.json();
};
