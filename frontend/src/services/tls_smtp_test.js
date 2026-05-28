const tls = require('tls');

const username = 'akash.mdev.0.2@gmail.com';
const passwords = [
  'spzsisqelekfwlse',
  'spzsisqelekfw1se', // trying number 1 instead of l
  'spzs isqe lekf wlse',
  'spzs1sqelekfwlse',
  'spzsiseqelekfslse'
];

function testPassword(password) {
  return new Promise((resolve) => {
    console.log(`[SMTP] Connecting to smtp.gmail.com:465 for password: '${password}'...`);
    
    const socket = tls.connect(465, 'smtp.gmail.com', {}, () => {
      console.log('[SMTP] Connected!');
    });

    let step = 0;
    socket.setEncoding('utf-8');
    
    socket.on('data', (data) => {
      console.log(`[SMTP RCV] ${data.trim()}`);
      
      if (data.startsWith('220') && step === 0) {
        socket.write('EHLO localhost\r\n');
        step = 1;
      } else if (data.includes('250-AUTH') || (data.startsWith('250') && step === 1)) {
        socket.write('AUTH LOGIN\r\n');
        step = 2;
      } else if (data.startsWith('334') && step === 2) {
        // Send base64 username
        socket.write(Buffer.from(username).toString('base64') + '\r\n');
        step = 3;
      } else if (data.startsWith('334') && step === 3) {
        // Send base64 password
        socket.write(Buffer.from(password).toString('base64') + '\r\n');
        step = 4;
      } else if (data.startsWith('235') && step === 4) {
        console.log('[SMTP SUCCESS] Authentication successful!');
        socket.write('QUIT\r\n');
        resolve(true);
      } else if (data.startsWith('535') && step === 4) {
        console.log('[SMTP FAILED] Authentication failed (535)');
        socket.write('QUIT\r\n');
        resolve(false);
      }
    });

    socket.on('error', (err) => {
      console.error('[SMTP ERR]', err.message);
      resolve(false);
    });
    
    socket.on('close', () => {
      console.log('[SMTP CLOSE] Connection closed.');
    });
  });
}

async function run() {
  for (const pwd of passwords) {
    const success = await testPassword(pwd);
    if (success) {
      console.log(`\n==== FOUND WORKING PASSWORD: ${pwd} ====\n`);
      break;
    }
  }
}

run();
