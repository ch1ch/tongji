;(function($){
  $.fn.TrackerClickBase = function (option){
    var TrackerBase = function ($this, option){
      this.opt = option;
      this.obj = $this;
      this.init();
    };
    TrackerBase.prototype = {
      init: function(){
        var _this = this;
        this.PAGE_TRACK_URL= "http://127.0.0.1:3020/log/log.gif";
        this.PAGE_CLICK_URL= "http://127.0.0.1:3020/log/t.gif";
        this.Pn="";

        if (this.opt.pageview) {
          _this.trackPageView();
        }else{
          _this.onClick();
        };
      },
      onClick: function(){
        var _this = this;
        var evt=_this.opt.evt;

        var dom = evt.target;
        if (!dom || !dom.tagName) return;
        var tagName = dom.tagName.toLowerCase();
        if (tagName != 'a' && tagName != 'button' && tagName != 'input') {
            dom = $(dom).closest('a')[0];
            if (!dom || !dom.tagName) {
                dom = $(dom).closest('data--tracker')[0];
                if (!dom || !dom.tagName) return;
                targetURL = dom.attr('data--tracker');
            }
            tagName = dom.tagName.toLowerCase();
        }

        if (tagName == 'input' && dom.type != 'submit' && dom.type != 'button') return;

        var targetURL = dom.href || "";
        if (dom.type == 'submit') {
            var cform = $(dom).closest('form')[0];
            if (cform && cform.action) { targetURL = cform.action; }
        }
        var clickDom = {
            dom: dom,
            tu: targetURL,
            cp: {
                left: evt.pageX,
                top: evt.pageY
            }
        };
        _this.trackClick(clickDom);
      },

      trackClick: function (clickObj) {
        var _this = this;
        _this.trackClick2(clickObj);
      },
   
          //记录页面click
      trackClick2: function (clickObj) {
          var _this=this;
          var requestBuilder = [];
          requestBuilder = requestBuilder.concat(this.PAGE_CLICK_URL);
          requestBuilder=this.getBaseParam(requestBuilder);
                    
          if ($(clickObj.dom).attr('data-track')) {
          requestBuilder = requestBuilder.concat(["&pan=", $(clickObj.dom).attr('data-track')]);  
          };
          requestBuilder = requestBuilder.concat(["&tp=", encodeURIComponent(this.getTargetDOMPath(clickObj.dom))]);
          this.log(requestBuilder.join(''));
      },

         //记录页面访问
      trackPageView: function (urlReferer) {
        var _this = this;
        var pvid = new Date().getTime();
        var requestBuilder = [];
        var browser = this.getBrowser();
        // requestBuilder.append(this._LOG_URL);
        requestBuilder = requestBuilder.concat(this.PAGE_TRACK_URL);
        requestBuilder = requestBuilder.concat(["?time=", pvid]);
        requestBuilder = requestBuilder.concat(["&url=", encodeURIComponent(location.href)]);
        requestBuilder = requestBuilder.concat(["&b=", browser.type]);
          requestBuilder = requestBuilder.concat(["&bVer=", browser.ver]);        
		    requestBuilder = requestBuilder.concat(["&u=", this.getUserCode()]);

        urlReferer = urlReferer || this.getReferrer() || "";
        if (urlReferer) {
            requestBuilder = requestBuilder.concat(["&ur=", encodeURIComponent(urlReferer)])
        };
        this.log(requestBuilder.join(''));
      },

      getTargetDOMPath: function (dom) {
        var _this=this;
        var pathArray = [];
        var cDom = dom;
        do {
            var tagName = cDom.tagName || "";
            tagName = tagName.toLowerCase();
            if (!tagName || tagName == "html") break;
            var targetDOMPathBuilder = [];

            targetDOMPathBuilder.push(tagName);

            if (cDom.id) targetDOMPathBuilder = targetDOMPathBuilder.concat(["#", cDom.id]);
            else {
                var cParentNode = cDom.parentNode;
                if (cParentNode.childNodes.length > 1) {
                    var tagIndex = 1;
                    for (var i = 0; i < cParentNode.childNodes.length; ++i) {
                        var siblingNode = cParentNode.childNodes[i];
                        if (siblingNode == cDom) {
                            break;
                        }
                        var sTagName = siblingNode.tagName || "";
                        if (sTagName.toLowerCase() == tagName) tagIndex++;
                    }
                    if (tagIndex > 1) targetDOMPathBuilder = targetDOMPathBuilder.concat([":eq(", tagIndex, ")"]);
                }
            }
            if (cDom.className) {
                var classNames = cDom.className.split(' ');
                targetDOMPathBuilder = targetDOMPathBuilder.concat([".", classNames.join('.')]);
            }
            var jDom = $(cDom);
            var pan = jDom.attr("pan");
            pan=jDom.attr("data-track")?jDom.attr("data-track"):pan;
            if (pan) targetDOMPathBuilder = targetDOMPathBuilder.concat(["[pan='", pan, "']"]);
            var pn = jDom.attr("pn");
            pn=jDom.attr("data-pn")?jDom.attr("data-pn"):pn;
            if (pn){
              targetDOMPathBuilder = targetDOMPathBuilder.concat(["[pn='", pn, "']"]);
              _this.pn=pn;
            } 
            pathArray.push(targetDOMPathBuilder.join(''));
            cDom = cDom.parentNode;
        } while (cDom);

        return pathArray.reverse().join('>');
      },
  

       /******************* Helper *******************/
      getBaseParam: function (requestBuilder) {
          var browser = this.getBrowser();
         
          requestBuilder = requestBuilder.concat(["?u=", this.getUserCode()]);
           requestBuilder = requestBuilder.concat(["&url=", encodeURIComponent(document.location.href)]);
          requestBuilder = requestBuilder.concat(["&w=", screen.width]);
          requestBuilder = requestBuilder.concat(["&h=", screen.height]);
          requestBuilder = requestBuilder.concat(["&r2=", encodeURIComponent(this.getReferrer())]);
          requestBuilder = requestBuilder.concat(["&b=", browser.type]);
          requestBuilder = requestBuilder.concat(["&bVer=", browser.ver]);

          return requestBuilder;
      },

      getReferrer: function () {
        var referrer = "";
        try {
            referrer = top.document.referrer;
        } catch (e) {
            if (parent) {
                try {
                    referrer = parent.document.referrer;
                } catch (e2) {
                    referrer = "";
                }
            }
        }
        if (referrer === "") {
            referrer = document.referrer;
        }
        return referrer;
      },

      getBrowser: function () {
        var browser={
            versions:function(){
                var u = navigator.userAgent, app = navigator.appVersion;
                return {
                    ie: u.indexOf('MSIE') > -1 || !!u.match(/Trident\/7\./), //IE内核
                    //trident: u.indexOf('Trident') > -1, //IE内核
                    opera: u.indexOf('Presto') > -1, //opera内核
                    webkit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                    gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1 //火狐内核
                };
            }(),
            language:(navigator.browserLanguage || navigator.language).toLowerCase()
        }
          var type = 0, ver = 0;
          var ua = navigator.userAgent.toLowerCase();
          var re =/(msie|firefox|chrome|opera|version|trident).*?([\d.]+)/;
          var m = ua.match(re);
          if (browser.versions.ie) {
              type = 1;
              ver = browser.versions.ie;
          } else if (browser.versions.gecko) {
              type = 2;
              ver = browser.versions.gecko;
          } else if (browser.versions.opera) {
              type = 3;
              ver = browser.versions.opera;
          } else if (browser.versions.webkit) {
              type = 4;
              ver = browser.versions.webkit;
          }
          ver=m[2];
          return { type: type, ver: ver };
      },
         
      cookie: function (name, value, options) {
          if (typeof value != 'undefined') { // name and value given, set cookie
              options = options || {};
              if (value === null) {
                  value = '';
                  options.expires = -1;
              }
              var expires = '';
              if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                  var date;
                  if (typeof options.expires == 'number') {
                      date = new Date();
                      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                  } else {
                      date = options.expires;
                  }
                  expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
              }
              var path = options.path ? '; path=' + options.path : '';
              var domain = options.domain ? '; domain=' + options.domain : '';
              var secure = options.secure ? '; secure' : '';
              document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
          } else { // only name given, get cookie
              var cookieValue = null;
              if (document.cookie && document.cookie != '') {
                  var cookies = document.cookie.split(';');
                  for (var i = 0; i < cookies.length; i++) {
                      var cookie = jQuery.trim(cookies[i]);
                      // Does this cookie string begin with the name we want?
                      if (cookie.substring(0, name.length + 1) == (name + '=')) {
                          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                          break;
                      }
                  }
              }
              return cookieValue;
          }
      },
      log: function (url) {
        // console.log("URL--",url);
        var now = new Date().getTime(), image = new Image(1, 1);
        image.onLoad = function () { };
        image.src = url + "&r=" + Math.random();
      },
   //用户的临时的Id，用于记录Visit
    getUserCode: function () {
        var userCode = this.cookie("_userCode_");
        if (userCode === null || userCode.length === 0) {
            var now = new Date(), builder = [];
            builder.push(now.getFullYear());
            builder.push(now.getMonth() + 1);
            builder.push(now.getDate());
            builder.push(now.getHours());
            builder.push(now.getMinutes());
            builder.push(now.getSeconds());
            builder.push(parseInt(Math.random() * 10000, 10));
            userCode = builder.join("");
            this.cookie("_userCode_", userCode);
        }
        return userCode;
    },

	    //用户的Id，用于记录新增用户和Visitor访问
    getUserIdentity: function () {
        var userCode = this.cookie("_userIdentity_"), isNewbie = false;
        if (userCode === null || userCode.length === 0) {
            isNewbie = true;
            var now = new Date(), builder = [];
            builder.push(now.getFullYear());
            builder.push(now.getMonth() + 1);
            builder.push(now.getDate());
            builder.push(now.getHours());
            builder.push(now.getMinutes());
            builder.push(now.getSeconds());
            builder.push(parseInt(Math.random() * 10000, 10));
            userCode = builder.join("");
            this.cookie("_userIdentity_", userCode);
        }
        return {
            id: userCode,
            isNewbie: isNewbie
        };
	    },

	    getEvent: function () {
	        //var event = $.param("event") || "";
	        var event = "";
	        if (!event || event.length === 0) {
	            event = this.cookie("_e_") || "";
	        }
	        if (event && event.length > 0) {
	            this.cookie("_e_", event);
	        }
	        return event;
	    }
	    
    };
   
    var config = {
      evt: null
    }
    option = $.extend(config, option);    
    this.each(function(){
      new TrackerBase($(this), option);
    });
  };
})(jQuery);
// 调用统计
	$("body").bind("mousedown", function(evt){
	  $(this).TrackerClickBase({
	    evt:evt
	  });
	});

	$("body").TrackerClickBase({
	  pageview:true
	});
