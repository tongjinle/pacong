const fs = require('fs');


async function capture(client,path) {
    const {Page} = client;
    const {data} = Page.captureScreenshot();
    fs.writeFileSync(path, Buffer.from(data, 'base64'));

}


module.exports = capture;