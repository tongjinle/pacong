async function delay(ms) {
    await new Promise(resolve => {
        setTimeout(() => {
            console.log('delay done');
            resolve();
        }, ms);
    });
}


module.exports = delay;