/**!
 * uiMatch.js by zhangxinxu(.com) for UI test
 * support Chrome.  Also, IE10+ , FireFox can use...
**/

(function() {
	var $ = function(selector, context) {
		context = context || document;
		return context.querySelector(selector);	
	}, $$ = function(selector, context) {
		context = context || document;
		return [].slice.call(context.querySelectorAll(selector));	
	};
	
	HTMLElement.prototype.bind = function(type, fn, capture) {
		this.addEventListener(type, fn, capture);
		return this;
	};
	String.prototype.query = function(key, value) {
		var arrSplitHash = this.split("#"), strUrlNoHash = arrSplitHash[0],
			arrSplitAsk = strUrlNoHash.split("?"), obj = {}, url = '';
		
		if (arrSplitAsk.length == 2) {
			arrSplitAsk[1].split("&").forEach(function(keyValue) {
				var arrSplitEqual = keyValue.split("=");
				if (arrSplitEqual.length == 2) {
					obj[arrSplitEqual[0]] = (arrSplitEqual[1] || "");
				}	
			});
			obj[key] = encodeURIComponent(value);
			url = arrSplitAsk[0] + "?" + (function() {
				var arr = [];
				for (var k in obj) {
					arr.push(k + "=" + obj[k]);
				}
				return arr.join("&");
			})();
		} else {
			url = strUrlNoHash + "?" + key + "=" + value;
		}
		return url + (arrSplitHash[1] || '');
	};
	
	// 弹框们
	var eleDialogs = $$("dialog");
	
	// 背景色改变
	var eleBgColor = $("#bgColor");
	eleBgColor && eleBgColor.bind("change", function() {
		document.body.style.backgroundColor = this.value;	
	});
	
	
	// ------以下为step1------
	var eleRadioUrl = $("#designByUrl"), eleInputUrl = $("#inputUrl"),
		eleRadioFile = $("#designByLocal"), eleInputFile = $("#inputFile"),
		eleFormDesign = $("#designForm");
	
	// 插入设计图的方法
	var funDesighUrl = function(object) {
		var eleDesignBox = $("#desighBox");
		if (!eleDesignBox) {
			eleDesignBox = document.createElement("div");
			eleDesignBox.id = "desighBox";
			eleDesignBox.className = "design_box";
			document.body.appendChild(eleDesignBox);
		}
		eleDesignBox.style.width = object.width + "px";
		eleDesignBox.style.height = object.height + "px";
		eleDesignBox.style.backgroundImage = "url(" + object.url + ")";
		funDesighUrl.dataObj = {
			width: object.width,
			height: object.height
		};
	};
	
	if (eleRadioUrl && eleInputUrl && eleRadioFile && eleInputFile && eleFormDesign) {
		eleRadioUrl.bind("click", function() {
			eleInputUrl.removeAttribute("disabled");
			eleInputFile.setAttribute("disabled", "");
			// 根据存储显示
			if (eleInputUrl.dataObj) funDesighUrl(eleInputUrl.dataObj);
		});
		eleRadioFile.bind("click", function() {
			eleInputUrl.setAttribute("disabled", "");
			eleInputFile.removeAttribute("disabled");
			// 根据存储显示
			if (eleInputFile.dataObj) funDesighUrl(eleInputFile.dataObj);	
		});
		
		var funInputUrl = function() {
			var url = eleInputUrl.value, image = new Image(),			
			obj = {
				url: url,
				width: 0,
				height: 0
			};
			if (url == '') {
				eleInputUrl.dataObj = null;	
			};
			image.onload = function() {
				obj.width = this.width;
				obj.height = this.height;
				eleInputUrl.dataObj = obj;
				funDesighUrl(obj);
			};
			image.onerror = function() {
				eleInputUrl.dataObj = null;	
				alert("图片地址有误！");
			}
			image.src = url;
		};
		eleInputUrl.bind("change", funInputUrl);
		
		if (eleRadioUrl.checked && eleInputUrl.value) {
			funInputUrl();
		}
		
		eleInputFile.bind("change", function(event) {
			var files = event.target.files || event.dataTransfer.files, file = files[0], obj = {};
			if (file.type.indexOf("image") == 0 || (!file.type && /\.(?:jpg|png|gif)$/.test(file.name)) /* for IE10 */) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var url = e.target.result, image = new Image();
					image.onload = function() {
						obj = {
							url: url,
							width: this.width,
							height: this.height
						};
						eleInputFile.dataObj = obj;
						funDesighUrl(obj);
						
						elePageTitle && (elePageTitle.value = file.name.split(".")[0]);
					};
					image.src= url;
				}
				reader.readAsDataURL(file);	
			} else {
				eleInputUrl.dataObj = null;
				alert('您选择的文件"' + file.name + '"不是图片！');	
			}
		});
		
		eleFormDesign.bind("submit", function(event) {
			// 隐藏弹框1，出现弹框2
			eleDialogs[0].removeAttribute("open");
			eleDialogs[1].setAttribute("open", "");
			event.preventDefault();
		});
	}
	// ----------step1 end ----------
	
	
	// ---------- step2 start-------
	
	var eleFormPage = $("#pageForm"),
		elePageTitle = $("#pageTitle"), elePageUrl = $("#pageUrl"),
		eleBtnBack = $("#backStepFirst");
		
	var strPageTitle = document.title, objPageMove = {
		flag: false,
		pageX: 0,
		pageY: 0,
		marginTop: 0,
		marginLeft: 0	
	}, objPageOperate = {
		opacity: function(box, frame) {
			var opacity = this.value, eleRefer = $("#opacityRefer");
			if (frame && opacity) {
				frame.style.opacity = opacity;	
				if (eleRefer) eleRefer.innerHTML = '透明度：' + opacity * 100 + "%";
			} 
		},
		scale: function(box) {
			var scale = this.value, eleRefer = $("#scaleRefer");
			box.style.WebkitTransform = 'translateX(-50%) scale('+ scale +')';
			box.style.transform = 'translateX(-50%) scale('+ scale +')';
			if (eleRefer) eleRefer.innerHTML = '比例：' + scale * 100 + "%";
			box.style.width = funDesighUrl.dataObj.width * (1 / scale) + "px";
		},
		place: function(box) {
			box.style.marginTop = 0;
			box.style.marginLeft = 0;
		},
		fresh: function(box, frame) {
			if (frame) { frame.src = frame.src.query("r", Date.now()); }
		}
	};
	
	// 插入页面图的方法
	var elePageBox = $("#pageBox"), eleOperate = $("#pageOperate");
	var funPageUrl = function(url) {
		var eleIframe = document.createElement("iframe");
		if (!elePageBox) {
			elePageBox = document.createElement("div");
			elePageBox.id = "pageBox";
			elePageBox.className = "page_box";
			elePageBox.style.width = funDesighUrl.dataObj.width + "px";
			elePageBox.style.height = funDesighUrl.dataObj.height + "px";
			document.body.insertBefore(elePageBox, document.body.firstChild);
			
			// Events
			// move
			elePageBox.bind("mousedown", function(event) {
				var tag = event.target.tagName.toLowerCase();
				if (tag == "a" || tag == "select") return;
				objPageMove.flag = true;
				objPageMove.marginTop = parseInt(this.style.marginTop) || 0;
				objPageMove.marginLeft = parseInt(this.style.marginLeft) || 0;
				objPageMove.pageX = event.pageX;
				objPageMove.pageY = event.pageY;
			});
			document.addEventListener("mousemove", function(event) {
				if (objPageMove.flag === true) {
					elePageBox.style.outline = "2px dashed #ccc";			
					elePageBox.style.marginTop = objPageMove.marginTop + ( event.pageY - objPageMove.pageY) + "px";
					elePageBox.style.marginLeft = objPageMove.marginLeft + (event.pageX - objPageMove.pageX) + "px";
				}
			});
			document.addEventListener("mouseup", function(event) {
				objPageMove.flag = false;
				elePageBox.style.outline = "none";
			});
			
			// 上下左右键微调
			document.addEventListener("keyup", function(event) {
				if (elePageBox) {
					var top = parseInt(elePageBox.style.marginTop) || 0, left = parseInt(elePageBox.style.marginLeft) || 0;

					if (event.keyCode == 37) {
						left--;
					} else if (event.keyCode == 38) {
						top--;
					} else if (event.keyCode == 39) {
						left++;
					} else if (event.keyCode == 40) {
						top++;
					}

					if (event.keyCode >= 37 && event.keyCode <= 40) {
						elePageBox.style.marginTop = top + 'px';
						elePageBox.style.marginLeft = left + 'px';
					}
				}

				event.preventDefault();
			});
		}
		if (eleOperate) {
			// 载入操作
			// elePageBox.appendChild(eleOperate);
			$$("select", eleOperate).forEach(function(sel) {
				sel.bind("change", function() {
					var key = this.getAttribute("data-key");
					objPageOperate[key].call(this, elePageBox, eleIframe);
				});
			});
			// operate
			eleOperate.bind("click", function(event) {
				var target = event.target, key = target && target.getAttribute("data-key");
				if (key && target.tagName.toLowerCase() == "a") {
					objPageOperate[key].call(target, elePageBox, eleIframe);
				}
			});
		}
		// 载入iframe
		eleIframe.frameborder = 0;
		eleIframe.src = url;
		elePageBox.appendChild(eleIframe);
	};
	
	// 返回上一步	
	if (eleBtnBack) {
		eleBtnBack.bind("click", function() {
			// 隐藏弹框2，出现弹框1
			eleDialogs[1].removeAttribute("open");
			eleDialogs[0].setAttribute("open", "");
		});
	}
	
	// 第二步确定
	var isStepSecondSubmit = false;
	if (eleFormPage && elePageTitle && elePageUrl) {
		if (localStorage.pageUrl) {
			elePageUrl.value = localStorage.pageUrl;
		}
		eleFormPage.bind("submit", function(event) {
			document.title = document.title + " » " + elePageTitle.value;
			funPageUrl(elePageUrl.value);
			eleDialogs[1].removeAttribute("open");
			isStepSecondSubmit = true;
			localStorage.pageUrl = elePageUrl.value;
			if (eleOperate) eleOperate.style.visibility = "visible";
			event.preventDefault();
		});
	}
	
	// ---------- step2 end ---------
	
	
	window.onbeforeunload = function() {
		if (isStepSecondSubmit == true) return '';
	};
})();