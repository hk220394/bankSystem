const nodemailer = require("nodemailer");

const testAccount = {
    user: 'c4pc2ufdw33tlwb4@ethereal.email',
    pass: '5fdNVuEcZ1ESDjKkce',
    smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
    imap: { host: 'imap.ethereal.email', port: 993, secure: true },
    pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
    web: 'https://ethereal.email'
}
emailTransporter = nodemailer.createTransport(
    /*
    as test account will only provide you attachment with mail 
    but might be you won't be able to download
    */
    {
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    }
    /*
    as test account will not provide you attachment so that 
    you can get by using gmail smtp
    */

    // {
    //     host: "smtp.gmail.com",
    //     port: 587,
    //     secure: false, // true for 465, false for other ports
    //     auth: {
    //         user: "", // generated ethereal user
    //         pass: "", // generated ethereal password
    //     },
    // }
);


const sendEmail = (emailData) => {
    console.log(emailData.attachments);
    emailTransporter.sendMail({
        attachments: emailData.attachments,
        from: '"XYZ Bank" <xyz@bank.com>', // sender address
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
    });

}

module.exports = {
    sendEmail
}

