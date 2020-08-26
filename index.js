const { getRefreshToken, getAccessToken, getAccounts, populateAccounts } = require('./helpers');

(async () => {
	try {
		const refreshToken = await getRefreshToken();
		const accessToken = await getAccessToken(refreshToken);
		const accounts = await getAccounts(accessToken);
		
		const parsedAccounts = await populateAccounts(accessToken, accounts);
		
		console.info(JSON.stringify(parsedAccounts, null, 4));
	} catch (err) {
		if (err.name === 'StatusCodeError') {
			console.error(`${err.statusCode} on ${err.options.url}`);
		} else {
			console.error(err.stack);
		}
	}
})();
