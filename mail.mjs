import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mailer = require('nodemailer');
const fs = require('fs');

let sender = mailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ais141@jain.software',
        pass: 'pvutrurtsflyuais'
    }
});
 
let mail = {
    from: 'ais141@jain.software',
    to:
        'career@jain.software',
    subject: '10k data',
    text: 'sent via node',
    html:
        '<h1>Sent via node (test) - Transformed data</h1>',
attachments: [
    {
        filename: 'data3.csv',
        path: 'C:\\Users\\Jain software\\Task for test\\' + 'end.csv',
        cid: 'uniq-data3.csv'
    }
]
};
 
sender.sendMail(mail, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent successfully: '
            + info.response);
    }
});