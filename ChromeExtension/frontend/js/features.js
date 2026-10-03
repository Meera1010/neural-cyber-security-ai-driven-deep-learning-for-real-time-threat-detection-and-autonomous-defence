
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

var currentPort = window.location.port;
if (currentPort && currentPort !== "" && currentPort !== "80" && currentPort !== "443") {
    result["Port"] = "1";
} else {
    result["Port"] = "-1";
}
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
    if(action.toLowerCase().startsWith("mailto")) {
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


function showInPageAlert() {
  if (document.getElementById("phishcatcher-alert-banner")) return;

  var banner = document.createElement("div");
  banner.id = "phishcatcher-alert-banner";
  banner.style.cssText = "position: fixed !important; top: 16px !important; right: 16px !important; z-index: 2147483647 !important; background: #0b1120 !important; color: #f1f5f9 !important; border: 2px solid #ef4444 !important; border-radius: 12px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(239, 68, 68, 0.4) !important; padding: 14px 18px !important; max-width: 380px !important; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; font-size: 13px !important; line-height: 1.4 !important;";

  banner.innerHTML = [
    "<div style='display: flex; align-items: flex-start; gap: 12px;'>",
    "  <div style='background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 8px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; min-width: 34px;'>",
    "    <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='#ef4444' stroke-width='2.5'><path d='M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z'/><line x1='12' y1='9' x2='12' y2='13'/><line x1='12' y1='17' x2='12.01' y2='17'/></svg>",
    "  </div>",
    "  <div style='flex: 1;'>",
    "    <div style='display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;'>",
    "      <strong style='color: #ef4444; font-size: 13px;'>Phishing Threat Warning!</strong>",
    "      <button id='phishcatcher-close-btn' style='background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; line-height: 1; padding: 0 4px;'>&times;</button>",
    "    </div>",
    "    <p style='margin: 0; color: #cbd5e1; font-size: 11px;'>Neural PhishCatcher detected anomalous phishing patterns on this page. Avoid entering credentials or personal info.</p>",
    "  </div>",
    "</div>"
  ].join("");

  document.body.appendChild(banner);

  var closeBtn = document.getElementById("phishcatcher-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function() {
      banner.remove();
    });
  }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.action == "alert_user") {
        console.log("PhishCatcher: Phishing indicators detected for this tab.");
        showInPageAlert();
      }
    });

