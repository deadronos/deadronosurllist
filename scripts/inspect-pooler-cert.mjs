import tls from 'tls';

const [host, port, servername] = process.argv.slice(2);
if (!host || !port) {
  console.error('Usage: node scripts/inspect-pooler-cert.mjs <host> <port> [servername]');
  process.exit(2);
}

const opts = {
  host,
  port: Number(port),
  servername: servername || host,
  rejectUnauthorized: false, // we only want to inspect the chain
  timeout: 10000,
};

const sock = tls.connect(opts, () => {
  try {
    const cert = sock.getPeerCertificate(true);
    if (!cert || Object.keys(cert).length === 0) {
      console.error('No certificate presented by server');
      sock.end();
      process.exit(1);
    }

    let idx = 0;
    function dump(c) {
      if (!c || Object.keys(c).length === 0) return;
      console.log(`--- Certificate #${idx} ---`);
      console.log('subject:', c.subject);
      console.log('issuer :', c.issuer);
      console.log('valid_from:', c.valid_from);
      console.log('valid_to  :', c.valid_to);
      if (c.fingerprint) console.log('fingerprint:', c.fingerprint);
      if (c.raw) console.log('raw (base64):', c.raw.toString('base64').slice(0, 80) + '...');
      idx++;
      if (c.issuerCertificate && c.issuerCertificate !== c) {
        dump(c.issuerCertificate);
      }
    }

    dump(cert);
  } catch (err) {
    console.error('Error inspecting certificate:', err);
  } finally {
    sock.end();
    process.exit(0);
  }
});

sock.on('error', (err) => {
  console.error('TLS socket error:', err);
  process.exit(1);
});

sock.on('timeout', () => {
  console.error('Connection timed out');
  sock.destroy();
  process.exit(1);
});