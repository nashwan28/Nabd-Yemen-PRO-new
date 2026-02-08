// API Client for نبض اليمن برو Frontend
class NabdYemenAPI {
    constructor() {
        const isProduction = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');
        this.baseURL = isProduction
            ? 'https://your-api-domain.com/api'
            : 'http://localhost:3000/api';
        
        this.token = localStorage.getItem('nabdToken');
        this.refreshToken = localStorage.getItem('nabdRefreshToken');
    }

    // Helper method for making API requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add authorization header if token exists
        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            // Handle token refresh
            if (response.status === 401 && data.message === 'Token expired') {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                    const retryResponse = await fetch(url, config);
                    return await retryResponse.json();
                }
            }

            if (!response.ok) {
                const error = new Error(data.message || 'API request failed');
                error.errors = data.errors || [];
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            if (error.stack) console.error('Stack:', error.stack);
            throw error;
        }
    }

    // Authentication methods
    async register(userData) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        
        if (response.success) {
            this.setTokens(response.data.token, response.data.refreshToken);
            localStorage.setItem('nabdUser', JSON.stringify(response.data.user));
        }
        
        return response;
    }

    async login(email, password, rememberMe = false) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password, rememberMe })
        });
        
        if (response.success) {
            this.setTokens(response.data.token, response.data.refreshToken);
            localStorage.setItem('nabdUser', JSON.stringify(response.data.user));
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.clearTokens();
            localStorage.removeItem('nabdUser');
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            this.clearTokens();
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            const data = await response.json();
            
            if (data.success) {
                this.setTokens(data.data.token, data.data.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }

        this.clearTokens();
        return false;
    }

    setTokens(token, refreshToken) {
        this.token = token;
        this.refreshToken = refreshToken;
        localStorage.setItem('nabdToken', token);
        localStorage.setItem('nabdRefreshToken', refreshToken);
    }

    clearTokens() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('nabdToken');
        localStorage.removeItem('nabdRefreshToken');
    }

    // User methods
    async getProfile() {
        return await this.request('/auth/profile');
    }

    async updateProfile(userData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    }

    async changePassword(currentPassword, newPassword) {
        return await this.request('/auth/change-password', {
            method: 'PUT',
            body: JSON.stringify({ currentPassword, newPassword })
        });
    }

    // Job methods
    async getJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/jobs?${params}`);
    }

    async getJobById(jobId) {
        return await this.request(`/jobs/${jobId}`);
    }

    async createJob(jobData) {
        return await this.request('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
    }

    async updateJob(jobId, jobData) {
        return await this.request(`/jobs/${jobId}`, {
            method: 'PUT',
            body: JSON.stringify(jobData)
        });
    }

    async deleteJob(jobId) {
        return await this.request(`/jobs/${jobId}`, {
            method: 'DELETE'
        });
    }

    async getEmployerJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/jobs/employer?${params}`);
    }

    async getMatchingJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/jobs/matching?${params}`);
    }

    async getUrgentJobs(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/jobs/urgent?${params}`);
    }

    async getJobStatistics() {
        return await this.request('/jobs/statistics');
    }

    // Application methods
    async submitApplication(jobId, applicationData) {
        return await this.request(`/applications/jobs/${jobId}`, {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    async getEmployerApplications(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/applications/employer?${params}`);
    }

    async getDoctorApplications(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/applications/doctor?${params}`);
    }

    async getApplicationById(applicationId) {
        return await this.request(`/applications/${applicationId}`);
    }

    async updateApplicationStatus(applicationId, statusData) {
        return await this.request(`/applications/${applicationId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(statusData)
        });
    }

    async withdrawApplication(applicationId) {
        return await this.request(`/applications/${applicationId}/withdraw`, {
            method: 'PATCH'
        });
    }

    async getApplicationStatistics() {
        return await this.request('/applications/statistics');
    }

    // Admin methods
    async getDashboardStats() {
        return await this.request('/admin/dashboard');
    }

    async getFollowUpApplications(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/follow-up-applications?${params}`);
    }

    async updateFinancialTracking(applicationId, financialData) {
        return await this.request(`/admin/applications/${applicationId}/financial-tracking`, {
            method: 'PATCH',
            body: JSON.stringify(financialData)
        });
    }

    async markCommissionPaid(applicationId, paymentData) {
        return await this.request(`/admin/applications/${applicationId}/mark-commission-paid`, {
            method: 'PATCH',
            body: JSON.stringify(paymentData)
        });
    }

    async getFinancialReports(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/financial-reports?${params}`);
    }

    async getAllApplications(filters = {}) {
        const params = new URLSearchParams(filters);
        return await this.request(`/admin/applications?${params}`);
    }

    async addAdminNote(applicationId, note) {
        return await this.request(`/admin/applications/${applicationId}/notes`, {
            method: 'POST',
            body: JSON.stringify({ note })
        });
    }

    // Utility methods
    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('nabdUser');
        return userStr ? JSON.parse(userStr) : null;
    }

    getUserType() {
        const user = this.getCurrentUser();
        return user ? user.userType : null;
    }

    isDoctor() {
        return this.getUserType() === 'doctor';
    }

    isEmployer() {
        return this.getUserType() === 'employer';
    }

    isAdmin() {
        return this.getUserType() === 'admin';
    }

    // File upload helper
    async uploadFile(file, type = 'document') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const response = await fetch(`${this.baseURL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        return await response.json();
    }
}

// Create global API instance
window.nabdAPI = new NabdYemenAPI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NabdYemenAPI;
}
