const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});

const sendMail = async ({ email, otp, isOtp }) => {

    const body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f2f2f2;
            margin: 0;
            padding: 0;
        }
        .container {
            background-color: #ffffff;
            width: 80%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333333;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            color: #999999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>OTP Verification</h1>
        </div>
        <div class="content">
            <p>Dear ${email},</p>
            <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
            <p class="otp">${otp}</p>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this email, please ignore it.</p>
        </div>
        <div class="footer">
            <p>Thank you,<br>admin@gmail.com</p>
        </div>
    </div>
</body>
</html>
`
    try {
        await transporter.sendMail({
            from: '"Task App 👻" <support@hitplay99.com>', // sender address
            to: "kraaz2605@gmail.com", // list of receivers
            subject: "OTP Verification", // Subject line
            text: "Dear User Your verification Code Is :", // plain text body
            html: isOtp ? body : null, // html body
        });
        return true;
        // res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.log(error.message);
        return false;
        // res.json({ success: false, message: "OTP sent faild" });


    }

}

module.exports = sendMail;