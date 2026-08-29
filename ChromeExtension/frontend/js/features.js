
/*
$('a').click(function(){
    alert("You are about to go to "+$(this).attr('href'));
});
*/

var result = {};

//---------------------- 1.  IP Address  ----------------------

var url = window.location.href;
// alert(url);
var urlDomain = window.location.hostname;

//url="0x58.0xCC.0xCA.0x62"

var patt = /(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9]?[0-9])(\.|$){4}/;
var patt2 = /(0x([0-9][0-9]|[A-F][A-F]|[A-F][0-9]|[0-9][A-F]))(\.|$){4}/;
var ip = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;


if(ip.test(urlDomain)||patt.test(urlDomain)||patt2.test(urlDomain)){ 
    result["IP Address"]="1";
}else{
    result["IP Address"]="-1";
}

//alert(result);

//---------------------- 2.  URL Length  ----------------------

//alert(url.length);
if(url.length<54){
    result["URL Length"]="-1";
}else if(url.length>=54&&url.length<=75){
    result["URL Length"]="0";
}else{
    result["URL Length"]="1";
}
//alert(result);
//---------------------- 3.  Tiny URL  ----------------------

var onlyDomain = urlDomain.replace('www.','');

if(onlyDomain.length<7){
    result["Tiny URL"]="1";
}else{
    result["Tiny URL"]="-1";
}
//alert(result);
//---------------------- 4.  @ Symbol  ----------------------

patt=/@/;
if(patt.test(url)){ 
    result["@ Symbol"]="1";
}else{
    result["@ Symbol"]="-1";
}
//---------------------- 5.  Redirecting using //  ----------------------

if(url.lastIndexOf("//")>7){
    result["Redirecting using //"]="1";
}else{
    result["Redirecting using //"]="-1";
}
//---------------------- 6. (-) Prefix/Suffix in domain  ----------------------

patt=/-/;
if(patt.test(urlDomain)){ 
    result["(-) Prefix/Suffix in domain"]="1";
}else{
    result["(-) Prefix/Suffix in domain"]="-1";
}
//---------------------- 7.  No. of Sub Domains  ----------------------

//patt=".";

if((onlyDomain.match(RegExp('\\.','g'))||[]).length==1){ 
    result["No. of Sub Domains"]="-1";
}else if((onlyDomain.match(RegExp('\\.','g'))||[]).length==2){ 
    result["No. of Sub Domains"]="0";    
}else{
    result["No. of Sub Domains"]="1";
}
//---------------------- 8.  HTTPS  ----------------------

patt=/https:\/\//;
if(patt.test(url)){
    result["HTTPS"]="-1";
}else{
    result["HTTPS"]="1";
}

function isLegitimateURL(targetUrl, currentDomain, baseDomain) {
    if (!targetUrl) return true;
    targetUrl = targetUrl.trim();
    if (targetUrl.startsWith('#') || targetUrl.startsWith('javascript:') || targetUrl.startsWith('data:')) return true;
    if (targetUrl.startsWith('/') && !targetUrl.startsWith('//')) return true;
    if (!targetUrl.includes('://') && !targetUrl.startsWith('//')) return true;

    try {
        var fullUrl = targetUrl.startsWith('//') ? (window.location.protocol + targetUrl) : targetUrl;
        var parsedHost = new URL(fullUrl).hostname.toLowerCase();
        if (parsedHost === currentDomain.toLowerCase()) return true;
        
        var curParts = currentDomain.toLowerCase().split('.');
        var targetParts = parsedHost.split('.');
        var curRoot = curParts.slice(-2).join('.');
        var targetRoot = targetParts.slice(-2).join('.');
        if (curRoot === targetRoot) return true;
    } catch(e) {}
    return false;
}

//---------------------- 10. Favicon  ----------------------
var favicon = undefined;
var nodeList = document.getElementsByTagName("link");
for (var i = 0; i < nodeList.length; i++)
{
    if((nodeList[i].getAttribute("rel") == "icon")||(nodeList[i].getAttribute("rel") == "shortcut icon"))
    {
        favicon = nodeList[i].getAttribute("href");
    }
}
if(!favicon) {
    result["Favicon"]="-1";
}else if(favicon.length==12){
    result["Favicon"]="-1";
}else{
    if(isLegitimateURL(favicon, urlDomain, onlyDomain)){
        result["Favicon"]="-1";
    }else{
        result["Favicon"]="1";
    }
}
//---------------------- 11. Using Non-Standard Port  ----------------------

result["Port"]="-1";
//---------------------- 12.  HTTPS in URL's domain part  ----------------------

patt=/https/;
if(patt.test(onlyDomain)){
    result["HTTPS in URL's domain part"]="1";
}else{
    result["HTTPS in URL's domain part"]="-1";
}

//---------------------- 13.  Request URL  ----------------------

var imgTags = document.getElementsByTagName("img");

var phishCount=0;
var legitCount=0;

for(var i = 0; i < imgTags.length; i++){
    var src = imgTags[i].getAttribute("src");
    if(!src) continue;
    if(isLegitimateURL(src, urlDomain, onlyDomain)){
        legitCount++;
    }else{
        phishCount++;
    }
}
var totalCount=phishCount+legitCount;
var outRequest= totalCount > 0 ? (phishCount/totalCount)*100 : 0;

if(outRequest<22){
    result["Request URL"]="-1";
}else if(outRequest>=22&&outRequest<61){
    result["Request URL"]="0";
}else{
    result["Request URL"]="1";
}

//---------------------- 14.  URL of Anchor  ----------------------
var aTags = document.getElementsByTagName("a");

phishCount=0;
legitCount=0;

for(var i = 0; i < aTags.length; i++){
    var hrefs = aTags[i].getAttribute("href");
    if(!hrefs) continue;
    if(isLegitimateURL(hrefs, urlDomain, onlyDomain)){
        legitCount++;
    }else{
        phishCount++;
    }
}
totalCount=phishCount+legitCount;
outRequest= totalCount > 0 ? (phishCount/totalCount)*100 : 0;

if(outRequest<31){
    result["Anchor"]="-1";
}else if(outRequest>=31&&outRequest<=67){
    result["Anchor"]="0";
}else{
    result["Anchor"]="1";
}

//---------------------- 15. Links in script and link  ----------------------

var sTags = document.getElementsByTagName("script");
var lTags = document.getElementsByTagName("link");

phishCount=0;
legitCount=0;

for(var i = 0; i < sTags.length; i++){
    var sTag = sTags[i].getAttribute("src");
    if(sTag!=null){
        if(isLegitimateURL(sTag, urlDomain, onlyDomain)){
            legitCount++;
        }else{
            phishCount++;
        }
    }
}

for(var i = 0; i < lTags.length; i++){
    var lTag = lTags[i].getAttribute("href");
    if(!lTag) continue;
    if(isLegitimateURL(lTag, urlDomain, onlyDomain)){
        legitCount++;
    }else{
        phishCount++;
    }
}
totalCount=phishCount+legitCount;
outRequest= totalCount > 0 ? (phishCount/totalCount)*100 : 0;

if(outRequest<17){
    result["Script & Link"]="-1";
}else if(outRequest>=17&&outRequest<=81){
    result["Script & Link"]="0";
}else{
    result["Script & Link"]="1";
}

//---------------------- 16.Server Form Handler ----------------------

var forms = document.getElementsByTagName("form");
var res = "-1";

for(var i = 0; i < forms.length; i++) {
    var action = forms[i].getAttribute("action");
    if(!action || action == "") {
        res = "1";
        break;
    } else if(!isLegitimateURL(action, urlDomain, onlyDomain)) {
        res = "0";
    }
}
result["SFH"] = res;

//---------------------- 17.Submitting to mail ----------------------

var forms = document.getElementsByTagName("form");
var res = "-1";

for(var i = 0; i < forms.length; i++) {
    var action = forms[i].getAttribute("action");
    if(!action) continue;
    if(action.startsWith("mailto")) {
        res = "1";
        break;
    }
}
result["mailto"] = res;

//---------------------- 23.Using iFrame ----------------------

var iframes = document.getElementsByTagName("iframe");

if(iframes.length == 0) {
    result["iFrames"] = "-1";
} else {
    result["iFrames"] = "1";
}

//---------------------- Sending the result  ----------------------

chrome.runtime.sendMessage(result, function(response) {
    if (chrome.runtime.lastError) {
        // suppress unchecked runtime.lastError warning
    }
});


chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "alert_user") {
        console.warn("PhishCatcher Alert: Phishing indicators detected on this page.");
      }
    });