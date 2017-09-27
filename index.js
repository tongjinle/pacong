// const CDP = require("chrome-remote-interface");

// console.log('CDP');

// CDP(chrome => {
// 	chrome.Page
// 		.enable()
// 		.then(() => {
// 			console.log('start');
// 			return chrome.Page.navigate({
// 				url: "http://www.baidu.com"
// 			});
// 		})
// 		.then(() => {
// 			console.log('after navigate');
// 			chrome.DOM.getDocument((error, params) => {
// 				console.log(params);
// 				if (error) {
// 					console.error(params);
// 					return;
// 				}
// 				const options = {
// 					nodeId: params.root.nodeId,
// 					selector: "img"
// 				};
// 				chrome.DOM.querySelectorAll(options, (error, params) => {
// 					if (error) {
// 						console.error(params);
// 						return;
// 					}
// 					params.nodeIds.forEach(nodeId => {
// 						const options = {
// 							nodeId: nodeId
// 						};
// 						chrome.DOM.getAttributes(options, (error, params) => {
// 							if (error) {
// 								console.error(params);
// 								return;
// 							}
// 							console.log(params.attributes);
// 						});
// 					});
// 				});
// 			});
// 		});
// }).on("error", err => {
// 	console.error(err);
// });



// const CDP = require('chrome-remote-interface');
// const fs = require('fs');

// CDP(async (client) => {
//     try {
//         const {Page, Tracing} = client;
//         // enable Page domain events
//         await Page.enable();
//         // trace a page load
//         const events = [];
//         Tracing.dataCollected(({value}) => {
//             events.push(...value);
//         });
//         await Tracing.start();
//         await Page.navigate({url: 'https://www.baidu.com'});
//         await Page.loadEventFired();
//         await Tracing.end();
//         await Tracing.tracingComplete();
//         // save the tracing data
//         fs.writeFileSync('/tmp/timeline.json', JSON.stringify(events));
//     } catch (err) {
//         console.error(err);
//     } finally {
//         await client.close();
//     }
// }).on('error', (err) => {
//     console.error(err);
// });



const CDP = require('chrome-remote-interface');
const fs = require('fs');

CDP(async (client) => {
    const {Page} = client;
    try {
        await Page.enable();
        await Page.navigate({url: 'https://github.com'});
        await Page.loadEventFired();
        const {data} = await Page.printToPDF({
            landscape: true,
            printBackground: true,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0
        });
        fs.writeFileSync('page.pdf', Buffer.from(data, 'base64'));
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}).on('error', (err) => {
    console.error(err);
});