#!/usr/bin/env node
import dns from 'node:dns/promises';
import process from 'node:process';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const env = process.env;
const results = [];

function ok(name, detail) {
  results.push({ status: 'ok', name, detail });
}

function warn(name, detail) {
  results.push({ status: 'warn', name, detail });
}

function fail(name, detail) {
  results.push({ status: 'fail', name, detail });
}

function has(...keys) {
  return keys.every((k) => Boolean(env[k] && String(env[k]).trim()));
}

async function checkSanity() {
  if (!has('SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_API_VERSION')) {
    warn('Sanity', 'Skipped (SANITY_PROJECT_ID/SANITY_DATASET/SANITY_API_VERSION not fully set).');
    return;
  }

  const projectId = env.SANITY_PROJECT_ID;
  const dataset = env.SANITY_DATASET;
  const apiVersion = env.SANITY_API_VERSION;
  const base = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}`;
  const query = encodeURIComponent('*[_type == "siteSettings"][0]{siteTitle}');
  const url = `${base}?query=${query}`;

  const headers = {};
  if (env.SANITY_READ_TOKEN) {
    headers.Authorization = `Bearer ${env.SANITY_READ_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      fail('Sanity', `HTTP ${res.status} from Sanity query endpoint.`);
      return;
    }
    ok('Sanity', 'Query endpoint reachable.');
  } catch (error) {
    fail('Sanity', `Request failed: ${String(error)}`);
  }
}

async function checkSupabase() {
  if (!has('SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')) {
    warn('Supabase', 'Skipped (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not fully set).');
    return;
  }

  try {
    const client = createSupabaseClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await client.from('subscribers').select('id', { count: 'exact', head: true }).limit(1);
    if (error) {
      fail('Supabase', `Query failed: ${error.message}`);
      return;
    }
    ok('Supabase', 'Service role can query subscribers table.');
  } catch (error) {
    fail('Supabase', `Client/query error: ${String(error)}`);
  }
}

async function checkResend() {
  if (!has('RESEND_API_KEY')) {
    warn('Resend', 'Skipped (RESEND_API_KEY not set).');
    return;
  }

  try {
    const res = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
    });
    if (!res.ok) {
      fail('Resend', `HTTP ${res.status} from domains endpoint.`);
      return;
    }
    const json = await res.json();
    const count = Array.isArray(json.data) ? json.data.length : 0;
    ok('Resend', `API reachable. Domains in account: ${count}.`);
  } catch (error) {
    fail('Resend', `Request failed: ${String(error)}`);
  }
}

function extractEmailDomain(emailFrom) {
  const at = emailFrom.lastIndexOf('@');
  if (at === -1) return null;
  return emailFrom.slice(at + 1).toLowerCase();
}

async function checkDns() {
  if (!has('EMAIL_FROM')) {
    warn('DNS', 'Skipped (EMAIL_FROM not set).');
    return;
  }
  const domain = extractEmailDomain(env.EMAIL_FROM);
  if (!domain) {
    fail('DNS', 'EMAIL_FROM does not contain a valid domain.');
    return;
  }

  let spfFound = false;
  let dmarcFound = false;

  try {
    const txtRecords = await dns.resolveTxt(domain);
    spfFound = txtRecords.some((record) => record.join('').toLowerCase().includes('v=spf1'));
  } catch {
    spfFound = false;
  }

  try {
    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`);
    dmarcFound = dmarcRecords.some((record) => record.join('').toLowerCase().includes('v=dmarc1'));
  } catch {
    dmarcFound = false;
  }

  if (spfFound && dmarcFound) {
    ok('DNS', `Found SPF + DMARC TXT records for ${domain}.`);
  } else {
    const missing = [!spfFound ? 'SPF' : null, !dmarcFound ? 'DMARC' : null].filter(Boolean).join(', ');
    warn('DNS', `Missing ${missing} TXT record(s) for ${domain}.`);
  }
}

async function run() {
  console.log('Integration verification starting...');
  await checkSanity();
  await checkSupabase();
  await checkResend();
  await checkDns();

  console.log('\nResults:');
  for (const result of results) {
    const icon = result.status === 'ok' ? 'OK' : result.status === 'warn' ? 'WARN' : 'FAIL';
    console.log(`[${icon}] ${result.name}: ${result.detail}`);
  }

  const failCount = results.filter((r) => r.status === 'fail').length;
  const warnCount = results.filter((r) => r.status === 'warn').length;
  console.log(`\nSummary: ${results.length} checks, ${failCount} failed, ${warnCount} warnings.`);

  if (failCount > 0) process.exit(1);
}

run().catch((error) => {
  console.error('Verification script crashed:', error);
  process.exit(1);
});
