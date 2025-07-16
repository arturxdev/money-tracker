const { Hono } = require('hono');
const { google } = require('googleapis');

const app = new Hono();
app.post('/add-expense', async (c) => {
	const CLIENT_ID = c.env.CLIENT_ID;
	const CLIENT_SECRET = c.env.CLIENT_SECRET;
	const REDIRECT_URI = c.env.REDIRECT_URI;
	const SHEETS_REFRESH_TOKEN = c.env.SHEETS_REFRESH_TOKEN;

	const { amount, name, merchant } = await c.req.json();
	const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
	oauth2Client.setCredentials({ refresh_token: SHEETS_REFRESH_TOKEN });
	const sheets = google.sheets({
		version: 'v4',
		auth: oauth2Client,
	});
	const date = new Date().toLocaleDateString('en-MX', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
	console.log(date, amount, name, merchant);
	await sheets.spreadsheets.values.append({
		spreadsheetId: '1MSg5ONFLXhmb5jkQioXDFaUkcY-VW0JC-rvimFuK6FY',
		range: 'Sheet1',
		valueInputOption: 'USER_ENTERED',
		requestBody: {
			values: [[date, amount, name, merchant]],
		},
	});

	return c.json({ message: 'Expense added successfully', data: { date, amount, name, merchant } });
});

export default app;
