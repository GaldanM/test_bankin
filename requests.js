const rp = require('request-promise');

const credentials = require('./credentials.json');

const baseUrl = 'http://localhost:3000';
const basicAuth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');

module.exports = {
	fetchRefreshToken() {
		const options = {
			method: 'POST',
			url: `${baseUrl}/login`,
			headers: { 'Authorization': `Basic ${basicAuth}` },
			body: {
				user: credentials.login,
				password: credentials.password,
			},
			json: true,
		};
		
		return rp(options);
	},
	fetchAccessToken(refreshToken) {
		const options = {
			method: 'POST',
			url: `${baseUrl}/token`,
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			form: {
				grant_type: 'refresh_token',
				refresh_token: refreshToken,
			},
			json: true,
		};
		
		return rp(options);
	},
	fetchAccounts(accessToken, page) {
		const options = {
			method: 'GET',
			headers: { 'Authorization': `Bearer ${accessToken}` },
			url: `${baseUrl}/accounts`,
			qs: { page },
			json: true,
		};
		
		return rp(options);
	},
	fetchTransactions(accessToken, accountNumber, page) {
		const options = {
			method: 'GET',
			headers: { 'Authorization': `Bearer ${accessToken}` },
			url: `${baseUrl}/accounts/${accountNumber}/transactions`,
			qs: { page },
			json: true,
		};
		
		return rp(options);
	},
}
