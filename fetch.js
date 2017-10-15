async function fetch(client, method, opts) {
    let {
        Runtime
    } = client;
    let wrapMethod = (method, str) => {
        let opts = str === undefined ? undefined : JSON.parse(str);
        return new Promise(resolve => {
            let ret = method(opts);
            // console.log(ret);
            resolve(ret);
        });
    };

    // 两次stringify
    // 第一次为了转字符串
    // 第二次为了套上引号

    let optsStr = JSON.stringify(opts);
    // console.log(optsStr);
    let exp = `(${wrapMethod})((${method}),${JSON.stringify(optsStr)})`;
    // console.log(exp);
    let result = await Runtime.evaluate({
        expression: exp,
        awaitPromise: true
    });
    // console.log({result});
    let value = result.result.value;

    return value;
}

module.exports = fetch;