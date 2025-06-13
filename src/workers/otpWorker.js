const { parentPort, workerData } = require('worker_threads');
const nodemailer = require('nodemailer');

const email = workerData.email;
const OTP = Math.floor(100000 + Math.random() * 900000).toString();

async function sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    return transporter.sendMail({
        from: `"No Reply" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is: ${otp}`,
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`
    });
}

sendOTP(email, OTP)
    .then(() => {
        parentPort.postMessage({ success: true, otp: OTP });
    })
    .catch(err => {
        console.error('Failed to send OTP email:', err);
        parentPort.postMessage({
            success: false,
            error: 'Failed to send OTP email Worker...' + err.message ,
        });
    });
