const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async(toEmail, token) => {
    try {
        const resetLink = `http://localhost:5000/reset-password/${token}`;
        console.log(resetLink);
        
        const testAccount = await nodemailer.createTestAccount();
        
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });

        const mailOptions = {
            from: `"Auth App" <no-reply@authapp.com>`,
            to: toEmail,
            subject: "Reset your password",
            html: `
                <h3>Reset your password</h3>
                <p>Click the link below to reset your password : </p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 10 minutes.</p>
            `
        };

        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.log("Got error in send reset password email function");
    }
}


module.exports = sendResetPasswordEmail;