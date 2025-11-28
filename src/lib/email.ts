import nodemailer from "nodemailer";

type SendEmailInput = {
    to: string;
    subject: string;
    text?: string;
    html?: string;
    from?: string;
};

const transporter = nodemailer.createTransport({
    host: "smtp.qq.com",
    port: 465,          // 587 也可，配 secure: false
    secure: true,       // 465 -> true
    auth: {
        user: process.env.SMTP_USER!, // QQ邮箱
        pass: process.env.SMTP_PASS!, // QQ邮箱“授权码”
    },
});

export async function sendEmail({ to, subject, text, html, from }: SendEmailInput) {
    return transporter.sendMail({
        from: from ?? process.env.SMTP_USER!,
        to,
        subject,
        text: text ?? " ",
        html,
    });
}
