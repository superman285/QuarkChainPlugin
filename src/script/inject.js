const injectionSite = (document.head || document.documentElement);
let s = document.createElement('script'),
    s2 = document.createElement('script'),
    s3 = document.createElement('script');

s.type = 'text/javascript';
s.src = 'https://cdn.jsdelivr.net/npm/web3@0.20.7/dist/web3.min.js';
//s.src = 'https://cdn.jsdelivr.net/npm/web3@1.2.4/dist/web3.min.js';
injectionSite.insertBefore(s, injectionSite.children[0]);

s.onload = ()=>{
  s2.type = 'text/javascript';
  s2.src = 'https://cdn.jsdelivr.net/npm/quarkchain-web3@2.0.0/dist/quarkchain-web3.js';
  s.parentNode.removeChild(s);
  injectionSite.insertBefore(s2, injectionSite.children[0]);
};

s2.onload = ()=>{
  //s3.type = 'module';
  s3.type = 'text/javascript';
  //注意路径 chrome.extension.getURL 是以src为根路径
  s3.src = chrome.extension.getURL('script/inpage2.js');
  s2.parentNode.removeChild(s2);
  injectionSite.insertBefore(s3, injectionSite.children[0]);
};

s3.onload = ()=>{
  console.log('inject chrome',chrome);
  s3.parentNode.removeChild(s3);
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request sender sendResponse',request,sender,sendResponse);
  sendResponse("我已收到你的消息：" + JSON.stringify(request));//做出回应


  let {accounts} = JSON.stringify(request);
  console.log('accounts',accounts);



});






