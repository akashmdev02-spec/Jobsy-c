const tls = require('tls');

const username = process.env.SPRING_MAIL_USERNAME || 'placeholder@gmail.com';
const password = process.env.SPRING_MAIL_PASSWORD || 'placeholder_password';

function testPassword(pwd) {
  return new Promise((resolve) => {
    console.log(`[SMTP] Connecting to smtp.gmail.com:465...`);
    
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
        socket.write(Buffer.from(username).toString('base64') + '\r\n');
        step = 3;
      } else if (data.startsWith('334') && step === 3) {
        socket.write(Buffer.from(pwd).toString('base64') + '\r\n');
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
  });
}

testPassword(password);
