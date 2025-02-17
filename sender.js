const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
        user: '【内容已被删除】', // 163邮箱地址
        pass: '【内容已被删除】' // 授权码
    }
});

let mailOptions = {
    from: '"流量监测系统" <【内容已被删除】>', // 发件人
    to: '【内容已被删除】', // 收件人
    subject: '水流量监测出现异常',
    text: '你好，水流量监测出现异常，望尽快寻找专业人员进行检修。',
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('邮件发送失败: ', error);
    }
    console.log('邮件发送成功: %s', info.messageId);
});
