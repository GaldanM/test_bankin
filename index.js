const { login, getToken, getUserAccounts, populateAccounts } = require('./helpers');

(async () => {
	try {
		const refreshToken = await login();
		const token = await getToken(refreshToken);
		const accounts = await getUserAccounts(token);
		
		const parsedAccounts = await populateAccounts(token, accounts);
		
		console.log(JSON.stringify(parsedAccounts, null, 4));
	} catch (err) {
		if (err.name === 'StatusCodeError') {
			console.error(`${err.statusCode} on ${err.options.url}`);
		} else {
			console.error(err.stack);
		}
	}
})();
