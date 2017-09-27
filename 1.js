const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const option = {
    port: 9222,
    chromeFlags: [
        '--headless'
    ]
};

chromeLauncher.launch(option)
    .then(start);



async function nodeAppears(client, selector) {
    // browser code to register and parse mutations
    const browserCode = (selector) => {
        return new Promise((fulfill, reject) => {
            new MutationObserver((mutations, observer) => {
                // add all the new nodes
                console.log(123);
                const nodes = [];
                mutations.forEach((mutation) => {
                    nodes.push(...mutation.addedNodes);
                });
                // fulfills if at least one node matches the selector
                if (nodes.find((node) => node.matches(selector))) {
                    observer.disconnect();
                    fulfill();
                }
            }).observe(document.body, {
                'childList': true,
                'subtree': true
            });
        });
    };
    // inject the browser code
    const {
        Runtime
    } = client;
    await Runtime.evaluate({
        expression: `(${browserCode})(${JSON.stringify(selector)})`,
        awaitPromise: true
    });
}

function demo() {
    setTimeout(() => {
        const foo = document.createElement('div');
        foo.id = 'foo';
        foo.innerText = 'foo';
        document.body.appendChild(foo);
    }, 3000);
}

function start() {
    CDP(async(client) => {
        const {
            Runtime
        } = client;
        try {
            // will add div
            await Runtime.evaluate({
                expression: `(${demo})()`
            });
            // wait for the element to be present
            await nodeAppears(client, 'div#foo');
            console.log('OK');
        } catch (err) {
            console.error(err);
        } finally {
            client.close();
        }
    }).on('error', (err) => {
        console.error(err);
    });
}