async function delay(ms) {
    if(Array.isArray(ms)){
        let [min,max] = ms;
        ms = ~~(Math.random()*(max-min)) + min;
    }
    await new Promise(resolve => {
        setTimeout(() => {
            console.log(ms +' delay done');
            resolve();
        }, ms);
    });
}


module.exports = delay;