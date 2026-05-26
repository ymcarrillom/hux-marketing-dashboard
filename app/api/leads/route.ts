import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const SHEET_ID = '1px-U8PO0EtVONGwVslz04xTKEiTIeFgLM_IM74POA6c';
const SHEET_NAME = 'Hoja 1';

async function getSheets() {
  const credentials = JSON.parse(Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '', 'base64').toString('utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export async function GET() {
  try {
    const sheets = await getSheets();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });

    const rows = res.data.values || [];
    if (rows.length < 2) return NextResponse.json([]);

    const headers = rows[0];
    const leads = rows.slice(1).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h: string, i: number) => { obj[h] = row[i] || ''; });
      return obj;
    });

    return NextResponse.json(leads);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error leyendo Sheet' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { telefono, seg_cerrado } = await req.json();
    const sheets = await getSheets();

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: SHEET_NAME,
    });

    const rows = res.data.values || [];
    const headers = rows[0];
    const telIdx = headers.indexOf('telefono');
    const segIdx = headers.indexOf('seg_cerrado');

    const rowIdx = rows.findIndex((r, i) => i > 0 && r[telIdx] === telefono);
    if (rowIdx === -1) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 });

    const range = `${SHEET_NAME}!${String.fromCharCode(65 + segIdx)}${rowIdx + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [[seg_cerrado]] },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 });
  }
}
