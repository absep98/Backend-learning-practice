const nodemailer = require("nodemailer");

const sendVerificationEmail = async (toEmail, token) => {
    const verificationLink = `http://localhost:5000/verify/${token}`;

    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });

    const info = await transporter.sendMail({
        from: `"Auth App" <no-reply@authapp.com>`,
        to: toEmail,
        subject: "Verify your email address",
        html: `
            <h2>Welcome! </h2>
            <p>Please click the following link to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire in 5 minutes.</p>
        `
    });

   console.log("Preview email at : ", nodemailer.getTestMessageUrl(info));
   
}

module.exports = sendVerificationEmail;