const rp = require('request-promise');

const credentials = require('./credentials.json');

const baseUrl = 'http://localhost:3000';

module.exports = {
	async login() {
		const basicAuth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
		
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
		
		const { refresh_token: refreshToken } = await rp(options);
		return refreshToken;
	},
	
	async getToken(refreshToken) {
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
		
		const { access_token: token } = await rp(options);
		return token;
	},
	
	async getUserAccounts(token) {
		const options = {
			method: 'GET',
			url: `${baseUrl}/accounts`,
			headers: { 'Authorization': `Bearer ${token}` },
			json: true,
		};
		
		const { account: accounts } = await rp(options);
		return accounts;
	},
	
	populateAccounts(token, accounts) {
		async function populateAccount(account) {
			const options = {
				method: 'GET',
				url: `${baseUrl}/accounts/${account.acc_number}/transactions`,
				headers: { 'Authorization': `Bearer ${token}` },
				json: true,
			};
			
			const { transactions } = await rp(options);
			
			return {
				acc_number: account.acc_number,
				amount: account.amount,
				transactions: transactions.map(t => ({
					label: t.label,
					amount: t.amount,
					currency: t.currency,
				})),
			};
		}
		
		return Promise.all(accounts.map(populateAccount));
	}
};
