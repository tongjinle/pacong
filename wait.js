async function wait(client,selector,maxTimeout = 5000){
    let {Runtime} = client;


    let exp = `(${method})(${JSON.stringify(selector)},${maxTimeout})`;
    let {result:{value:flag}} = await Runtime.evaluate({
        expression: exp,
        awaitPromise: true
    });

    return flag;
};


function method (selector,maxTimeout){
    return new Promise(resolve=>{
        // 200毫秒探测一次
        let interval = 200;
        let elapsed = 0;
        let t = setInterval(()=>{
            let node = document.querySelector(selector);
            if(node){
                // console.log({node});
                clearInterval(t);
                resolve(true);
                return;
            }
            elapsed+=interval;
            if(elapsed>=maxTimeout){
                clearInterval(t);
                resolve(false);
                return;
            }
        },interval);
    });
};

module.exports = wait;