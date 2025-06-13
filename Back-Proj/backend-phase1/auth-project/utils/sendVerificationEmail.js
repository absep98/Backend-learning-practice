const nodemailer = require("nodemailer");

const sendVerificationEmail = async (toEmail, token) => {
    const verificationLink = `http://localhost:5000/verify/${token}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: `"Auth App": <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Verify your email address",
        html: `
            <h2>Welcome! </h2>
            <p>Please click the following link to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire in 5 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);

}

module.exports = sendVerificationEmail;