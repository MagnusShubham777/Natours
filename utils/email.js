const nodemailer = require('nodemailer');
const htmltotext = require('html-to-text');
const pug = require('pug');


module.exports = class Email {
    constructor(user, url) {
        this.to = user.email,
            this.url = url,
            this.firstName = user.name.split(' ')[0],
            this.from = `Shubham Negi<${process.env.EMAIL_FROM}>`
    }

    //1)Create a transporter
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return 1;
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }
    async send(template, subject) {
        //Send email
        //Render HTMLbased on template
        //console.log(this.url);
        const html = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject
        });

        //Email options define
        const mailoptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmltotext.convert(html)
        }

        //Create a transport and send mail
        await this.newTransport().sendMail(mailoptions);
    }
    async sendWelcome() {
        await this.send("welcome", "Welcome to natours family");
    }
    async resetPassword() {
        await this.send("resetPassword", "your password reset token valid for 10 min")
    }

}

