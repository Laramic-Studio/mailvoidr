import type { LanguageTab } from '@/components/ui/code-block';

export interface SmtpConnection {
  host: string;
  port: number;
  username: string;
  password: string;
}

const MASK = '••••••••••••';

const dq = (value: string) => JSON.stringify(value);
const sq = (value: string) => `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const shq = (value: string) => `'${value.replace(/'/g, `'\\''`)}'`;

/**
 * Builds one snippet per language. `display` masks the password so it is safe to
 * leave on screen; `copy` carries the real credentials for the clipboard.
 */
function buildTabs(conn: SmtpConnection): Array<Omit<LanguageTab, 'code'> & { build: (pass: string) => string }> {
  const { host, port, username } = conn;

  return [
    {
      label: 'Node.js',
      filename: 'mailer.js',
      language: 'javascript',
      build: (pass) => `import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: ${dq(host)},
  port: ${port},
  secure: false,
  auth: {
    user: ${dq(username)},
    pass: ${dq(pass)},
  },
});

await transporter.sendMail({
  from: "from@example.com",
  to: "to@example.com",
  subject: "Hello from Mailvoidr",
  text: "This email was captured by your Mailvoidr sandbox.",
  html: "<h1>Hello from Mailvoidr</h1>",
});`,
    },
    {
      label: 'Laravel',
      filename: '.env',
      language: 'dotenv',
      build: (pass) => `MAIL_MAILER=smtp
MAIL_HOST=${host}
MAIL_PORT=${port}
MAIL_USERNAME=${username}
MAIL_PASSWORD=${pass}
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"`,
    },
    {
      label: 'PHP',
      filename: 'send.php',
      language: 'php',
      build: (pass) => `<?php
use PHPMailer\\PHPMailer\\PHPMailer;

require 'vendor/autoload.php';

$mail = new PHPMailer(true);
$mail->isSMTP();
$mail->Host = ${sq(host)};
$mail->Port = ${port};
$mail->SMTPAuth = true;
$mail->SMTPAutoTLS = false;
$mail->Username = ${sq(username)};
$mail->Password = ${sq(pass)};

$mail->setFrom('from@example.com', 'Mailvoidr Test');
$mail->addAddress('to@example.com');
$mail->isHTML(true);
$mail->Subject = 'Hello from Mailvoidr';
$mail->Body = '<h1>Hello from Mailvoidr</h1>';
$mail->AltBody = 'This email was captured by your Mailvoidr sandbox.';

$mail->send();`,
    },
    {
      label: 'Python',
      filename: 'send_mail.py',
      language: 'python',
      build: (pass) => `import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["From"] = "from@example.com"
msg["To"] = "to@example.com"
msg["Subject"] = "Hello from Mailvoidr"
msg.set_content("This email was captured by your Mailvoidr sandbox.")
msg.add_alternative("<h1>Hello from Mailvoidr</h1>", subtype="html")

with smtplib.SMTP(${dq(host)}, ${port}) as server:
    server.login(${dq(username)}, ${dq(pass)})
    server.send_message(msg)`,
    },
    {
      label: 'Django',
      filename: 'settings.py',
      language: 'python',
      build: (pass) => `EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = ${dq(host)}
EMAIL_PORT = ${port}
EMAIL_HOST_USER = ${dq(username)}
EMAIL_HOST_PASSWORD = ${dq(pass)}
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = "hello@example.com"`,
    },
    {
      label: 'Ruby on Rails',
      filename: 'config/environments/development.rb',
      language: 'ruby',
      build: (pass) => `config.action_mailer.delivery_method = :smtp
config.action_mailer.smtp_settings = {
  address: ${sq(host)},
  port: ${port},
  user_name: ${sq(username)},
  password: ${sq(pass)},
  authentication: :plain,
  enable_starttls_auto: false
}`,
    },
    {
      label: 'Go',
      filename: 'main.go',
      language: 'go',
      build: (pass) => `package main

import (
	"log"
	"net/smtp"
)

func main() {
	auth := smtp.PlainAuth("", ${dq(username)}, ${dq(pass)}, ${dq(host)})

	msg := []byte("From: from@example.com\\r\\n" +
		"To: to@example.com\\r\\n" +
		"Subject: Hello from Mailvoidr\\r\\n" +
		"\\r\\n" +
		"This email was captured by your Mailvoidr sandbox.\\r\\n")

	err := smtp.SendMail(${dq(`${host}:${port}`)}, auth, "from@example.com", []string{"to@example.com"}, msg)
	if err != nil {
		log.Fatal(err)
	}
}`,
    },
    {
      label: 'cURL',
      filename: 'terminal',
      language: 'bash',
      build: (pass) => `curl --url ${shq(`smtp://${host}:${port}`)} \\
  --user ${shq(`${username}:${pass}`)} \\
  --mail-from 'from@example.com' \\
  --mail-rcpt 'to@example.com' \\
  --upload-file - <<'EOF'
From: from@example.com
To: to@example.com
Subject: Hello from Mailvoidr

This email was captured by your Mailvoidr sandbox.
EOF`,
    },
    {
      label: '.env',
      filename: '.env',
      language: 'dotenv',
      build: (pass) => `SMTP_HOST=${host}
SMTP_PORT=${port}
SMTP_USER=${username}
SMTP_PASS=${pass}`,
    },
  ];
}

export function buildSmtpTabs(conn: SmtpConnection, revealPassword: boolean): LanguageTab[] {
  return buildTabs(conn).map(({ build, ...tab }) => ({
    ...tab,
    code: build(revealPassword ? conn.password : MASK),
    copyCode: build(conn.password),
  }));
}
