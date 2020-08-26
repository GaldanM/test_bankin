const requests = require('./requests');

module.exports = {
	async getRefreshToken() {
		const { refresh_token: refreshToken } = await requests.fetchRefreshToken();
		return refreshToken;
	},
	
	async getAccessToken(refreshToken) {
		const { access_token: accessToken } = await requests.fetchAccessToken(refreshToken);
		return accessToken;
	},
	
	async getAccounts(accessToken) {
		const accounts = [];
		let hasNext = true;
		let page = 1;
		
		while (hasNext) {
			const { account: fetchedAccounts, link } = await requests.fetchAccounts(accessToken, page++);
			
			const uniqueAccounts = accounts.map(acc => acc.acc_number);
			const dedupFetchedAccounts = fetchedAccounts.filter(acc => !uniqueAccounts.includes(acc.acc_number));
			accounts.push(...dedupFetchedAccounts);
			
			hasNext = Boolean(link && link.next);
		}
		
		return accounts;
	},
	
	populateAccounts(accessToken, accounts) {
		async function populateAccount(account) {
			const transactions = [];
			let hasNext = true;
			let page = 1;
			
			while (hasNext) {
				try {
					const { transactions: fetchedTransactions, link } = await requests.fetchTransactions(accessToken, account.acc_number, page++);
					
					const uniqueTransactions = transactions.map(t => t.id);
					const dedupFetchedTransactions = fetchedTransactions.filter(t => !uniqueTransactions.includes(t.id));
					transactions.push(...dedupFetchedTransactions);
					
					hasNext = Boolean(link && link.next);
				} catch (err) {
					// Somehow, when fetching transactions for account "0000000013", it returns a 400.
					// I find it best to just log and skip this account rather than interrupting the whole process.
					console.error(`Transactions for account "${account.acc_number}" could not be retrieved: ${err.message}`);
					hasNext = false;
				}
			}
			
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
