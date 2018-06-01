var isPad = (document.width?document.width:document.documentElement.clientWidth) >= 768;
var isH5App = (navigator.standalone && (/iphone|ipod|ipad/gi).test(navigator.userAgent));
var isIOS = (/iphone|ipod|ipad/gi).test(navigator.userAgent);
var isMobile = ((/iphone|ipod|ipad|android/gi).test(navigator.userAgent));
var isWeixin = ((/micromessenger/gi).test(navigator.userAgent));


function _GET_DATA(key){
    if(localStorage){
        var value = localStorage.getItem('_data__' + key);
        if(value){
            var j = JSON.parse(value);
            if(j.time && j.time < new Date()){
                localStorage.removeItem('_data__' + key);
                return null;
            }
            return j.data;
        }
    }
    return null;
}

function _SET_DATA(key,value,time){
    if(localStorage){
        var t = null;
        if(time && time.length >= 2){
            try{
                t = new Date();
                var n = parseInt(time.substring(0,time.length-1));
                var f = time.substring(time.length-1,time.length);

                switch(f){
                    case 's':t.setSeconds(t.getSeconds()+n);break;
                    case 'm':t.setMinutes(t.getMinutes()+n);break;
                    case 'h':t.setHours(t.getHours()+n);break;
                    case 'd':t.setDate(t.getDate()+n);break;
                    case 'w':t.setDate(t.getDate()+(n*7));break;
                    case 'M':t.setMonth(t.getMonth()+n);break;
                    case 'y':t.setFullYear(t.getFullYear()+n);break;
                }
                t = t.getTime();
            }catch(e){
                t = null;
            }
        }
        localStorage.setItem('_data__' + key,JSON.stringify({data:value,time:t}));
        return true;
    }
    return false;
}

function _DEL_DATA(key){
    if(localStorage){
        localStorage.removeItem('_data__' + key);
    }
}

function _CLEAR_DATA(justCache){
    if(localStorage){
        for(var i = 0;i < localStorage.length;){
            if((localStorage.key(i).indexOf('_data__')) != -1){
                if(justCache){
                    var value = localStorage.getItem(localStorage.key(i));
                    if(value){
                        var j = JSON.parse(value);
                        if(j.time && j.time < new Date()){
                            if(localStorage.removeItem){
                                localStorage.removeItem(localStorage.key(i));
                            }else{
                                return;
                            }
                        }else{
                            i ++;
                        }
                    }
                }else{
                    if(localStorage.removeItem){
                        localStorage.removeItem(localStorage.key(i));
                    }else{
                        return;
                    }
                }
            }else{
                i ++;
            }
        }
    }
}

function _CLEAR_DATA_WHILE(justCache){
    var i = 0;
    while(i < localStorage.length){
        if(localStorage.key(i).indexOf('_data__') != -1){
            if(justCache){
                var value = localStorage.getItem(localStorage.key(i));
                if(value){
                    var j = JSON.parse(value);
                    if(j.time && j.time < new Date()){
                        localStorage.removeItem(localStorage.key(i));
                    }else{
                        i ++;
                    }
                }
            }else{
                localStorage.removeItem(localStorage.key(i));
            }
        }else{
            i ++;
        }
    }
}


/*点击*/
var tap_id = undefined,tap_move = false;
function tap(el,func,className,justFirst,els,i){
    if(!el)return;
    function tap_start(ev){
        if(!justFirst || (justFirst && tap_id == undefined)){
            tap_id = el.id;
            tap_move = false;

            if(className && !el.classList.contains(className)){
                el.classList.add(className);
            }
        }

    }
    function tap_move(ev){
        tap_move = true;
        if(className && el.classList.contains(className)){
            el.classList.remove(className);
        }
    }
    function tap_end(ev){

        if(className && el.classList.contains(className)){
            el.classList.remove(className);
        }
        if(tap_id == el.id && !tap_move){
            ev.stopPropagation();
            ev.preventDefault();
            if(func){
                func(el,ev,els,i);
            }
            tap_id = undefined;
            return false;
        }
        tap_id = undefined;
        return false;
    }
    el.addEventListener("touchstart",tap_start,false);
    el.addEventListener("touchmove",tap_move,false);
    el.addEventListener("touchend",tap_end,false);
    el.tap = function(){
        func(el);
    }
}
function tap_one(el,func,className){
    if(!el)return;
    function tap_start(){
        event.stopPropagation();
        tap_move = false;
        tap_id = el.id;
        if(className && !el.classList.contains(className)){
            el.classList.add(className);
        }
    }
    function tap_move(){
        tap_move = true;
        if(className && el.classList.contains(className)){
            el.classList.remove(className);
        }
    }
    function tap_one_end(){
        if(className && el.classList.contains(className)){
            el.classList.remove(className);
        }
        if(tap_id == el.id && !tap_move){
            if(func){
                func(el);
            }
            event.preventDefault();
            el.removeEventListener("touchstart",tap_start);
            el.removeEventListener("touchmove",tap_move);
            el.removeEventListener("touchend",tap_one_end);
            return false;
        }
        return false;
    }
    el.addEventListener("touchstart",tap_start,false);
    el.addEventListener("touchmove",tap_move,false);
    el.addEventListener("touchend",tap_one_end,false);
}
function taps(els,func,className,justFirst){
    for(var i=0;i<els.length;i++){
        tap(els[i],func,className||els[i].dataset.tapClass,justFirst,els,i);
    }
}
window.addEventListener('load',function(){
    taps(document.querySelectorAll('[data-url]'),function(el){
        location = el.dataset.url;
    });
    taps(document.querySelectorAll('[data-tap]'),function(el){
        window.el = el;
        eval(el.dataset.tap);
    });
    taps($('#myCommonDialog button'),function(){
        $('#myCommonDialog').removeClass('in');
        setTimeout(function(){
            $('#myCommonDialog').hide();
            if(_option && _option.close){
                wx.closeWindow();
            }
            if(_option && _option.reload){
                location.reload();
            }
            if(_option && _option.url){
                location = _option.url;
            }

            if(_option && _option.replace){
                location.replace(_option.replace);
            }

        },100);
    });
    taps($('#myCommonDialog2 .btn'),function(el){
        $('#myCommonDialog2').removeClass('in');
        setTimeout(function(){
            $('#myCommonDialog2').hide();
            if($(el).hasClass('btn-ok')){
                if(showConfirmCallback){
                    showConfirmCallback();
                }
            }
        },100);
    });
});

//验证车牌号码
function verCarCard(no){
    if(/^[\u4e00-\u9fa5][A-Z][\d|A-Z]{4}[\u4e00-\u9fa5|\d|A-Z]$/.test(no)){
        return true;
    }
     return false;

}

//验证
function verDiscount(no){
    if(no.length > 0){
        return true;
    }
     return false;

}
var _option = {};
function showMessage(msg,opt){
    $('#myCommonDialogMessage').html(msg);
    $('#myCommonDialog').show();
    setTimeout(function(){
        $('#myCommonDialog').addClass('in');
    },100);
    _option = opt;
}
function showConfirm(msg){
    $('#myCommonDialogMessage2').html(msg);
    $('#myCommonDialog2').show();
    setTimeout(function(){
        $('#myCommonDialog2').addClass('in');
    },100);
}

function timeFormat(timeSpan){

    if(!timeSpan || timeSpan == 'NaN' || isNaN(timeSpan)){
        return '--';
    }
    var timeStr = '';
    if(timeSpan > 60 * 24){
        timeStr += parseInt(timeSpan/(60*24))+'天';
    }
    if(timeSpan > 60){
        timeStr += parseInt(timeSpan/60)%24+'小时';
    }
    if(timeSpan % 60 > 0){
        timeStr += parseInt(timeSpan % 60) + '分钟';
    }

    return timeStr;
}
function request(paras)
{
	var url = location.search;
	var paraString = url.substring(url.indexOf("?")+1,url.length).split("&");
	var paraObj = {}
	for (i=0; j=paraString[i]; i++){
		paraObj[j.substring(0,j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf("=")+1,j.length);
	}
	var returnValue = paraObj[paras.toLowerCase()];
	if(typeof(returnValue)=="undefined"){
		return "";
	}else{
		return returnValue;
	}
}
function setField(data,el){
    var field_els = el ? $(el).find('[field]') : $('[field]');
	for(var field in data){
        field_els.each(function(i,el){
            var fields = el.attributes.getNamedItem('field').value.split('.');
            if(fields.indexOf(field) > -1){
                if(typeof(dataset)=="function")
                    dataset(el);
                var value = data[fields[0]];
                if(fields.length > 1){
                    for(var j=1;j<fields.length;j++){
                        if(value){
                            value = value[fields[j]];
                        }
                    }
                }
                if(value === false){
                    el.style.display = 'none';
                }else if(el.nodeName == "IMG"){
                    el.src = value;
                }else if(el.nodeName == "INPUT"){
                    el.value = value;
                }else if(el.nodeName == "SELECT"){
                    dataset(el);
                    var key = el.dataset.key;
                    select:
                    for(var j =0;j< el.options.length;j++){
                        var option = el.options[j];
                        if((key == "text" && option.text == value) || (key != "text" && option.value == value)){
                            el.selectedIndex = j;
                            el.onchange && el.onchange();
                            break select;
                        }
                    }
                    el.dataset.value = value;
                }else{
                    if(el.dataset.format == "num"){
                        el.innerText = numFormat(value);
                    }else if(el.dataset.format == "time"){
                        el.innerText = timeFormat(value);
                    }else if(el.dataset.format == "date"){
                        el.innerText = new Date(value).Format('yyyy-MM-dd');
                    }else if(el.dataset.format == "datetime"){
                        el.innerText = new Date(value).Format('yyyy-MM-dd hh:mm:ss');
                    }else if(el.dataset.format == "html"){
                        el.innerHTML = value || el.dataset.default || value;
                    }else{
                        el.innerText = value || el.dataset.default || value;
                    }
                    if(window.navigator.userAgent.toLowerCase().indexOf("firefox")!=-1)
                    {
                        el.textContent = el.innerText;
                    }
                }
            }
        });
    }
}

function dataset(el){
    if(el && !el.dataset){
        el.dataset = {};
        for(var i = 0;i < el.attributes.length;i++){
            var attr = el.attributes[i];
            if(attr.name.toLowerCase().indexOf('data-') == 0){
                el.dataset[attr.name.substr(5)] = attr.value;
            }
        }
    }
}
function showAlert(msg,fun){
	document.getElementsByClassName('cover').item(0).style.height = (document.height?document.height:document.documentElement.clientHeight)+"px";
	document.getElementsByClassName('alertMsg').item(0).classList.remove("popShakeOut");
	document.getElementsByClassName('alertMsg').item(0).classList.add("popShakeIn");
	document.getElementsByClassName('alertMsg').item(0).style.display = "block";
	document.getElementsByClassName('cover').item(0).style.display = "block";
	if(msg){
        document.getElementById("messageText").innerHTML = msg;
	}
	if(fun){
        document.getElementsByClassName('alertMsg').item(0).addEventListener("touchend",fun);
	}
	document.body.addEventListener('touchmove',preventDefault,false);
	document.getElementsByClassName('cover').item(0).addEventListener('touchstart',preventDefault,false);
	
}
var isSubmit = false;
function closeAlert(){
	if(!isSubmit){
		document.getElementsByClassName('cover').item(0).style.display = "none";
		document.getElementsByClassName('alertMsg').item(0).classList.remove("popShakeIn");
		document.getElementsByClassName('alertMsg').item(0).classList.add("popShakeOut");
		document.body.removeEventListener('touchmove',preventDefault,false);
		setTimeout("document.getElementsByClassName('alertMsg').item(0).style.display = 'none';",400);
	}
}


String.prototype.replaceAll = function(oldValue,newValue){
    return this.toString().replace(new RegExp(oldValue,'gm'),newValue);
//    return this.toString().split(oldValue).join(newValue);
}
String.prototype.toObject = function(obj){
    var string = this.toString();
    for(var key in obj){
        string = string.replaceAll('{' + key + '}',obj[key]);
    }
    return string;
}

Number.prototype.toFix = function(){
    var int = parseFloat(this);
    if(int.toString().indexOf('.') > 0){
        return parseFloat(int.toFixed(2));
    }
    return int;
}

