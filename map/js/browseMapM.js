
var data,d=1,maxLevel = 5,minLevel=0.3,isClient=false,dis_x=.5,dis_y=.5,drawPosition=true;
var Levels = [0.002,0.0035,0.006,0.01];
var maxLevel = Levels[Levels.length-1];
var minLevel = Levels[0];
var CurrentLevel = 0;
var currentParkID = request('parkID');
var currentFloor;
var isAPP = false;
var featureList;
var serverMapPointList;
var parkConfig;
var mapUrl = request('map_url');
var checkOut = request('check_out');
var mapData = request('map_data');
var debug = request('debug');

var showOtherList = false;
function initCanvas(){
   var w = $("#viewerDiv").width();
   var h = $("#viewerDiv").height();
   var cw = $("#canvas").width();
   var ch = $("#canvas").height();
   var l = (w-cw)/2;
   var t = (h-ch)/2;
   $("#div_parent").css({'left':l+'px','top':t+'px'});
}
 
if(isWeixin){
    var script = document.createElement('SCRIPT');
    script.src = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js';
    document.head.appendChild(script);
}

var currentPoint,carPoint,autoCalc=false,showType,showCalc=false,calcResult,calcResult1;
$(function(){
    
    
    if(isWeixin){
        $('.sao').show();
        taps($('.sao'),function(){
            window.scanQrCode();
        });
        
        getSignature();
    }
    //_CLEAR_DATA();
    initCanvas();
    
    taps($("#zoomIn"),function(){
        if(CurrentLevel < Levels.length - 1){
            CurrentLevel ++;
            d = Levels[CurrentLevel];
            drawCanvas();
        }else{
            mui.toast('已是最大级别');
        }
    });

    taps($("#zoomOut"),function(){
        if(CurrentLevel > 0){
            CurrentLevel --;
            d = Levels[CurrentLevel];
            drawCanvas();
            // updateOffset(Levels[CurrentLevel + 1], d);
        }else{
            mui.toast('已是最小级别');
        }
    });

    function updateOffset(oldLevel, newLevel) {
        var c_w = -$("#canvas").width()/2;
        var c_h = $("#canvas").height()/2;
        var w = -$("#viewerDiv").width();
        var h = $("#viewerDiv").height();
        var left = Number(obj.style.left.replace('px','')) ;
        var top = Number(obj.style.top.replace('px','')) ;
        var od = oldLevel;
        var d = newLevel;

        obj.style.left = ((left + w/2 - c_w)/od * d) + 'px';
        obj.style.top = ((top + h/2 - c_h)/od * d) + 'px';
    }
    taps($("#iamhere"),function(){
        var spaceNo = $('#space input').val().trim().toUpperCase();
        var space = getSpace(spaceNo);
        if(space){
            $('cover,popup').hide();
            var point = PolygonCenter(space.points);
            currentPoint = {
                floor:space.floor,
                x:point.x,
                y:point.y,
                name:space.label
            };
            currentPoint.featurePoint = currentPoint.floor + '-' + currentPoint.x + '-' + currentPoint.y;
            if(carPoint){
                autoCalc = showCalc = true;
                calcResult = calcPath(currentPoint,carPoint);
            }
            
            linkFloor(currentPoint.floor);
            
            if(currentPoint){
                $('.currentAddress').text(currentPoint.floor + '层' + currentPoint.name);
            }
            if(currentPoint || carPoint){
                $('#info').show();
            }else{
                $('#info').hide();
            }
            $('#space input').blur();
            mui.toast('已将车位' + spaceNo + '标记为当前位置');
        }else{
            mui.toast('车位号：' + spaceNo + '不存在');
        }
        if(document.activeElement.tagName == 'INPUT'){
            $('.mui-toast-container').addClass('input');
        }
    });
    taps($("#carhere"),function(){
        var spaceNo = $('#space input').val().trim().toUpperCase();
        var space = getSpace(spaceNo);
        if(space){
            $('cover,popup').hide();
            var point = PolygonCenter(space.points);
            carPoint = {
                floor:space.floor,
                x:point.x,
                y:point.y,
                name:space.label
            };
            carPoint.featurePoint = carPoint.floor + '-' + carPoint.x + '-' + carPoint.y;
            $('.targetAddress').text(carPoint.floor + '层' + carPoint.name);
            
            if(currentPoint){
                autoCalc = showCalc = true;
                calcResult = calcPath(currentPoint,carPoint);
                linkFloor(currentPoint.floor);
            }else{
                linkFloor(carPoint.floor);
            }
            
            
            
            if(currentPoint || carPoint){
                $('#info').show();
            }else{
                $('#info').hide();
            }
            $('#space input').blur();
            mui.toast('已将车位' + spaceNo + '标记为车的位置');
        }else{
            mui.toast('车位号：' + spaceNo + '不存在');
        }
        if(document.activeElement.tagName == 'INPUT'){
            $('.mui-toast-container').addClass('input');
        }
    });
    
    taps($(".btn_lookcar"),function(el){
        
        if($(".btn_lookcar")[0].className == 'btn_lookcar' || $(".btn_lookcar")[0].className == 'btn_lookcar active'){
//            autoCalc = true;
//            showCalc = true;
//            linkFloor(currentPoint.floor);
            mui.confirm('将当前点标记为停车点？','','',function(obj){
                if(obj.index == 1){
                    setcarpoint('',currentPoint.pointID,function(){
                        mui.alert('标记成功');
                        carPoint = currentPoint;
                        autoCalc = false;
                        showCalc = false;
                        drawCanvas();
                    });
                }
            });
        }else{
            showOtherList = true;
            $('cover,popup#otherList').show();
        }
        
        
    },'',true);
    
    
    
    var obj = document.getElementById('div_parent');
    var body = document.body;
    var msg = $('.cube');
    var startX=0,startY=0,xx=0,yy=0,iX=0,iY=0,starDist=0,moveDist = 0,c_c=0,d_d=0,pp;
    body.addEventListener('touchstart', function(event) {
        if(showOtherList){
            return;
        }
         // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {
            //event.preventDefault();// 阻止浏览器默认事件，重要 
            var touch = event.targetTouches[0];
            // 把元素放在手指所在的位置
            xx = startX = touch.pageX;
            yy = startY = touch.pageY;
            iX = touch.clientX - this.offsetLeft;
            iY = touch.clientY - this.offsetTop;
            //msg.text(touch.pageX + ','+touch.pageY + ';' + touch.clientX + ',' + touch.clientY);
        }else if(event.targetTouches.length == 2){
            drawPosition = false;
            starDist = distancePoint(event.targetTouches);
            var c_c_c = getTwoTouchCenter(event.targetTouches);
            var cw = $("#canvas").width();
            var ch = $("#canvas").height();
            dis_x = c_c_c.c_x/cw;
            dis_y = c_c_c.c_y/ch;
            d_d=c_c = canvasCenter();
        }
    }, false);
    body.addEventListener('touchmove', function(event) {
        if(showOtherList){
            return;
        }
        
        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length == 1) {
            event.preventDefault();// 阻止浏览器默认事件，重要 
            var touch = event.targetTouches[0];
            // 把元素放在手指所在的位置
            var dx = touch.pageX - startX;
            var dy = touch.pageY - startY;
            obj.style.left = (Number(obj.style.left.replace('px',''))+dx) + 'px';
            obj.style.top = (Number(obj.style.top.replace('px',''))+dy) + 'px';
            
            startX = touch.pageX;
            startY = touch.pageY;
            
            //msg.text(touch.pageX + ','+touch.pageY + ';' + touch.clientX + ',' + touch.clientY);
        }else if(event.targetTouches.length == 2){
            moveDist = distancePoint(event.targetTouches);
            var di = moveDist/starDist;
            d = d*di;
            if(d>maxLevel){
		    d=maxLevel;
		    }
		    if(d<minLevel){
		      d=minLevel;
		    }
            var cw = $("#canvas").width();
            var ch = $("#canvas").height();
            $("#canvas,#div_parent").width(cw*di);
            $("#canvas,#div_parent").height(ch*di);
            d_d = canvasCenter();
            setCenter(c_c,d_d);
   
            starDist = distancePoint(event.targetTouches);
        }
    }, false);
    body.addEventListener('touchend', function(event) {
        if(showOtherList){
            return;
        }
        // 如果这个元素的位置内只有一个手指
        drawPosition = true;
        if(moveDist!=0){
             drawCanvas();
        }else{
             if(startX-xx<2&&startX-xx>-2&&startY-yy<2&&startY-yy>-2){  
                 //judgePoint({'x':iX,'y':iY});
                 //calcPath(iX,iY);
             }
        }
        moveDist=starDist = 0;
        c_c=d_d=0;
    }, false);

    if(isAPP == false){
        
        try{
            currentPoint = eval('('+decodeURIComponent(request('currentPoint')) +')');
            carPoint = request('carPoint') ? eval('('+decodeURIComponent(request('carPoint'))+')') : false;
            
            //currentPoint = {x:78177,y:179205,floor:'B1',pointName:'A区0003'};
            //carPoint = {x:42583,y:241110,floor:'B1',pointName:'A区0055'};
            
            showType = request('showType');
            if(showType=='7' || showType == '6'){
                $('#info').hide();
            }
        }catch(e){
            autoCalc = showCalc = false;
        }
        
        if(!currentPoint && !carPoint){
            $('#info').hide();
        }
        searchmappoint(currentParkID,function(mappoints){
            serverMapPointList = mappoints.data.mapPointList;
            searchfeature({
                parkID:currentParkID
            },function(res){
                featureList = res.data.featureList;
                initData();
            });
        });
    }
    
    taps($(".close"),function(){
    	$("popup").hide();
    	$("cover").hide();
        showOtherList = false;
    });
    // -------------- 加载预览地图 --------------
    if (mapUrl){
        localStorage.clear();
        getData(mapUrl,'1',function(res){
            $('loadding').hide();
            initMap(res);
            if (checkOut) {
                checkPath(10, 5);
            }
        });
    }
    if (mapData){
        initMap(_GET_DATA('data'));
    }
    // -------------- ----------- --------------
 });

function initMap(data) {
    $('loadding').hide();
    totalData = data;
    if(showType=='1' || showType == '6'){
        autoCalc = showCalc = true;
    }else{
        autoCalc = false;
    }
    initControl();
    linkFloor(window._defaultFloor || totalData[0].floor);
}


function getSignature(){
	$.ajax({
		url: api_url+'../../weixinservice/getsignature',// 跳转到 action    
	    data:{"url":window.location.href},
	    type:'get',    
	    cache:false,    
	    dataType:'json',
	    success:function(data) {
	    	var d = data.data;
	    	wx.config({
		        appId: d.appID,
		        timestamp: d.timestamp,
		        nonceStr: d.nonceStr,
		        signature: d.signature,
		        jsApiList: [
		        	"scanQRCode"
	            ]
			});
	    	wx.ready(function () {
	    		window.scanQrCode = function(){
	    			wx.scanQRCode({
		    			needResult: 1,
		    			desc: 'scanQRCode desc',
		    			success: function (res) {
		    				var qrCode = res.resultStr;
		    				scancode(qrCode,1,function(res){
                                if(res.success){
                                    currentPoint = res.data.point;
                                    if(currentPoint){
                                        $('.currentAddress').text(currentPoint.floor + '层' + currentPoint.pointName);
                                        $('#info').show();
                                        if(showType == '7'){
                                            currentPoint.featurePoint = currentPoint.floor + '-' + currentPoint.x + '-' + currentPoint.y;
                                        }
                                        calcResult = calcResult1 = false;
                                        autoCalc = showCalc = true;
                                        linkFloor(currentPoint.floor);
                                    }
                                }else{
                                    mui.alert('请扫定位专用二维码');
                                }
                                
                            });
		    			},
                        cancel: function(){
                            closeWindow();
                        }
		    	    });
	    		};
	    		
	    		closeWindow = function(){
		    		wx.closeWindow();
		    	};
	    	});

	    	wx.error(function (res) {
                mui.alert(JSON.stringify(res));
	    		wx.closeWindow();
	    	});
		},    
	    error:function() {
	    }
	});
};


var totalData;
//在线专用
function initData(){
    package(currentParkID,function(res1){
        if(!res1.data.map_url){
            $('loadding').text('该车场暂无地图数据'+currentParkID);
            return;
        }
        parkConfig = res1.data.config;
        if(parkConfig){
            if(parkConfig.wifilocationserver){
                $('.btn_lookcar').hide();
                $('.sao').hide();
            }
        }
        getData(res1.data.map_url,res1.data.map_md5,function(res){
            $('loadding').hide();
            totalData = res;

            initControl();

            if(showType=='1' || showType == '6'){
                autoCalc = showCalc = true;
            }else{
                autoCalc = false;
            }
            
            if(currentPoint){
                if(currentPoint.parkingspace){
                    currentPoint =  getPointByParkingspaceNo(currentPoint.parkingspace);
                }
                if(currentPoint.floor){
                    $('.currentAddress').text(currentPoint.floor + '层' + (currentPoint.pointName || currentPoint.name || ''));
                    if(showType == '7'){
                        currentPoint.featurePoint = currentPoint.floor + '-' + currentPoint.x + '-' + currentPoint.y;
                    }
                }else{
                    if(parkConfig && parkConfig.wifilocationrefreshinterval && parkConfig.wifilocationrefreshinterval > 0 && parkConfig.wifilocationserver){
                        $('.currentAddress').text(parkConfig.wifilocationunreachable);
                    }else{
                        $('.currentAddress').text('暂未获取');
                    }
                }

            }
            if(carPoint){
                if(carPoint.parkingspace){
                    carPoint =  getPointByParkingspaceNo(carPoint.parkingspace);
                }
                if(carPoint){
                    if(carPoint.floor){
                        $('.targetAddress').text(carPoint.floor + '层' + (carPoint.parkingspace || carPoint.name || ""));
                        if(showType == '7'){
                            carPoint.featurePoint = carPoint.floor + '-' + carPoint.x + '-' + carPoint.y;
                        }
                    }else if(carPoint.parkingspace){
                        $('.targetAddress').html(carPoint.parkingspace + '<font color=#999>地图中不存在的车位</font>');
                    }
                }else{
                    
                }
                
            }
            if(currentPoint && currentPoint.floor){
                linkFloor(currentPoint.floor);
            }else{
                if(carPoint && carPoint.floor){
                    linkFloor(carPoint.floor);
                }else{
                    linkFloor(window._defaultFloor || totalData[0].floor);
                }
            }
            
            if(showType!='0'){
                showCalc = true;
                switch(showType){
                    case  1   :
                    case '1'  :autoCalc = true;break;
                    case  2   :
                    case '2'  :$('nav item[data-class=shop]')[0].tap();break;
                    case  2.1 :
                    case '2-1':$('nav item[data-class=hotel]')[0].tap();break;
                    case  3   :
                    case '3'  :$('nav item[data-class=toll]')[0].tap();break;
                    case  4   :
                    case '4'  :$('nav item[data-class=carexit]')[0].tap();break;
                    case  5   :
                    case '5'  :$('nav item[data-class=toilet]')[0].tap();break;
                    case  8   :
                    case '8'  :$('nav item[data-class=elevator]')[0].tap();break;
                }
            }
        });
    });
}

//APP专用
function initPage(options,pointData,mapData,points,features,config){
    isAPP = true;
    featureList = features;
    serverMapPointList = points;
    parkConfig = config;
    totalData = mapData;
    
    currentPoint = pointData.currentPoint;
        carPoint = pointData.carPoint;
        showType = pointData.showType;
    
    if(currentPoint){
        if(currentPoint.parkingspace){
            currentPoint =  getPointByParkingspaceNo(currentPoint.parkingspace);
        }
        if(currentPoint.floor){
            $('.currentAddress').text(currentPoint.floor + '层' + (currentPoint.pointName || currentPoint.name || ''));
            if(showType == '7'){
                currentPoint.featurePoint = currentPoint.floor + '-' + currentPoint.x + '-' + currentPoint.y;
            }
        }else{
            if(parkConfig){
                if(parkConfig.wifilocationrefreshinterval && parkConfig.wifilocationrefreshinterval > 0 && parkConfig.wifilocationserver){
                    $('.currentAddress').text(parkConfig.wifilocationunreachable);
                }
            }
        }
    }
    if(carPoint){
        if(carPoint.parkingspace){
            carPoint =  getPointByParkingspaceNo(carPoint.parkingspace);
        }
        carPoint.featurePoint = carPoint.floor + '-' + carPoint.x + '-' + carPoint.y;
    }
    
    $('loadding').hide();
    $('.btn_lookcar').hide();
    
    initControl();
    
    
    if(showType=='7' || showType == '6'){
        $('#info').hide();
    }else{
        $('#info').show();
    }
    if(showType=='1' || showType == '6'){
        autoCalc = showCalc = true;
    }else{
        autoCalc = false;
    }
    if(currentPoint && currentPoint.floor){
        linkFloor(currentPoint.floor);
    }else{
        if(carPoint && carPoint.floor){
            linkFloor(carPoint.floor);
        }else{
            linkFloor(window._defaultFloor || totalData[0].floor);
        }
    }
    if(showType!='0'){
        showCalc = true;
        switch(showType){
            case  1   :
            case '1'  :autoCalc = true;break;
            case  2   :
            case '2'  :$('nav item[data-class=shop]')[0].tap();break;
            case  2.1 :
            case '2-1':$('nav item[data-class=hotel]')[0].tap();break;
            case  3   :
            case '3'  :$('nav item[data-class=toll]')[0].tap();break;
            case  4   :
            case '4'  :$('nav item[data-class=carexit]')[0].tap();break;
            case  5   :
            case '5'  :$('nav item[data-class=toilet]')[0].tap();break;
            case  8   :
            case '8'  :$('nav item[data-class=elevator]')[0].tap();break;
        }
    }
}


//绘制地图计数，用于异步绘图时的过期验证
var _Draw_Canvas_Counter = 0;
//画地图方法
function drawCanvas(){
    _Draw_Canvas_Counter ++;
    
    var c = canvasCenter();
    var div_parent = document.getElementById('div_parent');
         $("canvas").remove("#canvas");
         var canvas = createCanvas(); 
         div_parent.appendChild(canvas);

    
	

	for(var i=0;i<data.background.polygons.length;i++){
        try{
            drawPolygon(canvas,data.background.polygons[i]);
        }catch(ex){
            console.error('background.polygons on line:'+i);
        }
		
	}
    for(var i=0;i<data.background.lines.length;i++){
		drawPolyline(canvas,data.background.lines[i]);
	}

	for(var i=0;i<data.background.arcs.length;i++){
		drawArc(canvas,data.background.arcs[i]);
	}
    canvas.getContext("2d").save();

	for(var i = 0;i<data.parks.length;i++){
        var park = data.parks[i];
        if(!park.id){
            park.center = PolygonCenter(park.points);
            //park.namexy = park.center.x + ',' + park.center.y;
            park.id = data.floor + '-' + park.center.x + '-' + park.center.y;
            park.floor = data.floor;
            park.type = 'space-normal';
            park.flag = 2;
            
        }
        if(carPoint && park.id == carPoint.featurePoint){
            park.selected = true;
        }
        if(currentPoint && park.id == currentPoint.featurePoint){
            park.selected = true;
        }
		drawPark(canvas,data.parks[i]);
	}

	for(var i = 0;i<data.acc_parks.length;i++){
        var park = data.acc_parks[i];
        if(!park.id){
            park.center = PolygonCenter(park.points);
            //park.namexy = park.center.x + ',' + park.center.y;
            park.id = data.floor + '-' + park.center.x + '-' + park.center.y;
            park.floor = data.floor;
            park.type = 'space-normal';
            park.flag = 2;
        }
        if(carPoint && park.id == carPoint.featurePoint){
            park.selected = true;
        }
        if(currentPoint && park.id == currentPoint.featurePoint){
            park.selected = true;
        }
		drawPark(canvas,data.acc_parks[i]);
	}

	for(var i = 0;i<data.background.points.length;i++){
        var bgPoint = data.background.points[i];
		drawImage(canvas,bgPoint,_Draw_Canvas_Counter, CurrentLevel);
	}

        var ds = canvasCenter();
        setCenter(c,ds);

    if (debug) {
        //绘制行车路线
	for(var i=0;i<data.path.points.length;i++){
	    var point = data.path.points[i];
        point.num = 0;
        for(var j=0;j<data.path.lines.length;j++){
            if(data.path.lines[j].a == point.id || data.path.lines[j].b == point.id){
                point.num ++;
            }
        }
		drawNumber(canvas,point);
    }
    var colors = ['green','red','blue','yellow','black','orgle'];
	var ctx=canvas.getContext("2d");
	for(var i=0;i<data.path.lines.length;i++){
		var a = getPoint(data.path.lines[i].a, data.path.points);
		var b = getPoint(data.path.lines[i].b, data.path.points);
		ctx.beginPath();
		drawMoveTo(ctx,a);
		drawLineTo(ctx,b);
        ctx.lineWidth = 3;
        var grad  = ctx.createLinearGradient(js_x(a.x),js_y(a.y), js_x(b.x),js_y(b.y));
        if(a.num == 1 && b.num == 1){
            /* 指定几个颜色 */
            grad.addColorStop(0,'red');    // 红
            grad.addColorStop(0.2,'rgba(192, 80, 77,0.5)'); // 绿
            grad.addColorStop(0.8,'rgba(192, 80, 77,0.5)'); // 绿
            grad.addColorStop(1,'red');  // 紫
        }else{
            /* 指定几个颜色 */
            grad.addColorStop(0,'green');    // 红
            grad.addColorStop(0.2,'rgba(155, 187, 89,0.5)'); // 绿
            grad.addColorStop(0.8,'rgba(155, 187, 89,0.5)'); // 绿
            grad.addColorStop(1,'green');  // 紫
        }
		ctx.strokeStyle=grad;
		ctx.stroke();
	}
    }
   
    setTimeout(function(){
        if(calcResult && showCalc){
            if(calcResult1 && carPoint.floor == currentFloor){
                drawPath(calcResult1);
            }else if(currentPoint.floor == currentFloor){
                drawPath(calcResult);
            }
            
        }else {
            calcResult = false;
            var ctx = canvas.getContext("2d");
            if(currentPoint && currentPoint.floor == currentFloor){
                if(showType != '7'){
                    preImage("img/my.png",function(){
                        var h = this.height;
                        var w = this.width;
                        ctx.drawImage(this,js_x(currentPoint.x)-w/2,js_y(currentPoint.y)-h/2,w,h);
                    });
                }else{
                    preImage("img/end_car.png",function(){
                        var h = this.height;
                        var w = this.width;
                        ctx.drawImage(this,js_x(currentPoint.x)-w/2,js_y(currentPoint.y)-h,w,h);
                    });
                }
                
            }
        }
        if(carPoint && !autoCalc && carPoint.floor == currentFloor && showType != '7'){
            var ctx = canvas.getContext("2d");
            preImage("img/end_car.png",function(){
                var h = this.height;
                var w = this.width;
                ctx.drawImage(this,js_x(carPoint.x)-w/2,js_y(carPoint.y)-h,w,h);
            });
        }
        
    },0);
    
}


function draw(point) {
    $('#pop').show();
    $('#pop_qr').hide();
    $('#pop_xy').text('x:'+parseInt(point.x) + ' y:'+parseInt(point.y));
    $("#pop").css({position: "absolute",'left':js_x(Number(point.x)),'top':js_y(Number(point.y)) - 125});
}

function initIndoorMap(f){
    
    currentFloor = f;
    for(var i in totalData){
        if(totalData[i].floor == f){
            data = totalData[i];
            initCanvas();
            executefunc();
        }
    }
    
}

var templateNav = '<item data-class="{class}" data-text="{text}" data-type="{type}" class="{class}"></item>';
function executefunc(){
    Levels = data.levels;
    data.width=data.max.x-data.min.x;
	data.height=data.max.y-data.min.y;
	dw=($("#viewerDiv").width()-200)/data.width;
	dh=($("#viewerDiv").height()-200)/data.height;
	if(dw<=dh) d=dw; else d=dh;
	minLevel=d;
    CurrentLevel = 0;
    Levels[0] = d;
    
    if(data.nav){
        var htmlNav = '';
        for(var i=0;i<data.nav.length;i++){
            var nav = data.nav[i];
            htmlNav += templateNav.toObject(nav);
        }
    }
    
    $('nav').html(htmlNav);
    taps($("nav item"),function(el){
        
        if(el.dataset.class == 'space'){
            $('cover,popup').hide();
            $('cover,popup#space').show();
            return
        }
        
        if(!currentPoint || !currentPoint.floor){
            mui.toast('请先扫码或者连接WIFI来获取您的当前位置');
            return;
        }
        
        if(currentFloor != currentPoint.floor){
            linkFloor(currentPoint.floor);
        }
        
        autoCalc = false;
        calcResult1 = false;
        showCalc = true;
        var types = el.dataset.type.split(',');
        
        var arrayPoint = data.background.points.filter(function(item){
            return types.indexOf(item.text) > -1;
        });
        
        if(arrayPoint.length == 0){
            mui.alert('抱歉，本层没有' + el.dataset.text);
            return;
        }
        
        arrayPoint.forEach(function(item,index){
            delete item.calcResult;
            delete item.calcResult1;
        });
        
        if(el.dataset.class == 'shop' || el.dataset.class == 'hotel'){
            var type = 'enter-' + el.dataset.class;
            var html = '';
            arrayPoint.forEach(function(item,index){
                var features = (featureList.filter(function(feature){
                    return feature.featurePoint == item.id && feature.floor == currentFloor;
                }));
                item.types = [];
                features.forEach(function(feature){
                    if(item.types.indexOf(feature.type) == -1){
                        item.types.push(feature.type);
                    }
                });
                
//                var text = '';
//                if(item.text == 'lift'){
//                    text = '电梯';
//                }
//                if(item.text == ''){
//                    text = '电梯';
//                }
                if(item.types.indexOf(type) > -1){
                    if(features.length > 0){
                        html += '<div id="itemPoint'+index+'" class="shop_list itemPoint" data-item="'+encodeURIComponent(JSON.stringify(item))+'">\
                                    <div class="pointname staircase down"><img src="png/'+item.text+'.png"  alt=""/>'+item.name+' <div class="down_up"></div></div>';
                        features.forEach(function(feature){
                            html += '<div class="shop_item">'+feature.name+'</div>';
                        });
                        html += '</div>';
                    }else{
                        //html += '<div class="pointname staircase"><img src="png/'+item.text+'.png"  alt=""/>'+item.id+' </div>';
                    }
                }
            });
            arrayPoint = arrayPoint.filter(function(item,index){
                return item.types.indexOf(type) > -1;
            });
            if(arrayPoint.length == 0){
                $('.post_ul li').html('抱歉，本层没有' + el.dataset.text);
                mui.alert('抱歉，本层没有' + el.dataset.text);
                return;
            }
            $('.post_ul li').html(html);
        }else{
            var type = el.dataset.class;
            var html = '';
            arrayPoint.forEach(function(item,index){
                item.name = item.name || el.dataset.text;
                html += '<div id="itemPoint'+index+'" class="pointname staircase itemPoint" data-item="'+encodeURIComponent(JSON.stringify(item))+'"><img src="png/'+item.text+'.png"  alt=""/>'+item.name+' </div>';
            });
            $('.post_ul li').html(html);
        }
        taps($('.post_ul li .itemPoint'),function(el){
            var item = JSON.parse(decodeURIComponent(el.dataset.item));
            calcResult = calcPath(currentPoint,item);
            calcResult.calcType = item.text;
            setCenterAndZoom(calcResult.minPoint,calcResult.maxPoint,true);
            $("cover,popup").hide();
            showOtherList = false;
        },'',true);
        
        taps($(".pointname .down_up"),function(el){
            if($(el).parent().hasClass('down')){
                $(el).parent().removeClass('down').addClass("up");
                $(el).parents('.itemPoint').find('.shop_item').hide();
            }else{
                $(el).parent().removeClass("up").addClass("down");
                $(el).parents('.itemPoint').find('.shop_item').show();
            }
        },'',true);
        
        arrayPoint.forEach(function(item,index){
            item.calcResult = calcPath(currentPoint,item);
        });
        
        arrayPoint.sort(function(a,b){
            return a.calcResult.length > b.calcResult.length ? 1 : -1;
        });
        
        if(arrayPoint.length){
            
            switch(el.dataset.class){
                case 'shop':showType='2';break;
                case 'hotel':showType='2-1';break;
                case 'toll':showType='3';break;
                case 'carexit':showType='4';break;
                case 'toilet':showType='5';break;
                case 'elevator':showType='8';break;
            }
            ['shop','hotel','toll','carexit','toilet','elevator'].forEach(function(item){
                $('.btn_lookcar').removeClass(item);
            });
            $('.btn_lookcar').addClass(el.dataset.class);
            
            calcResult = arrayPoint[0].calcResult;
            calcResult.calcType = el.dataset.text;
            setCenterAndZoom(calcResult.minPoint,calcResult.maxPoint,true);

            $("nav item,.btn_lookcar").removeClass('active');
            $(el).addClass('active').show();
            
            $('#info').show();
            
            window._el = el;
        }
        
    },'active');
    
    if(serverMapPointList){
        for(var i = 0;i<data.background.points.length;i++){
            var bgPoint = data.background.points[i];
            serverMapPointList.forEach(function(item){
                if(item.floor == data.floor && item.id == bgPoint.id){
                    bgPoint.name = item.name;
                }
            });
        }
    }
    
    if(!calcResult1){
        if(autoCalc && carPoint && !(currentPoint.floor == carPoint.floor && currentPoint.floor != currentFloor)){
            if(currentPoint.floor == currentFloor && currentPoint.floor == carPoint.floor){
                calcResult = calcPath(currentPoint,carPoint,showType == '6');
            }else if(data.channel && (currentFloor == currentPoint.floor || currentFloor == carPoint.floor)){
                //如果不在同一楼层，则先查找出联通两楼层的两点，分别计算路径
                var arrayPoint = data.channel.filter(function(item){
                    return item.floor == carPoint.floor;
                });
                arrayPoint.forEach(function(item,index){
                    delete item.calcResult;
                    delete item.calcResult1;
                });

                arrayPoint.forEach(function(item){
                    item.point = data.background.points.filter(function(point){
                        return point.id == item.id;
                    })[0];


                    var data1 = totalData.filter(function(li){
                        return li.floor == item.floor;
                    })[0];

                    item.point1 = data1.background.points.filter(function(point){
                        return point.id == item.id2;
                    })[0];

                    if(!item.point || !item.point1){
                        console.log(item);
                        return;
                    }
                    item.point.floor = currentPoint.floor;
                    item.point1.floor = carPoint.floor;
                    item.calcResult = calcPath(currentPoint,item.point);
                    item.calcResult.align = 'start';
                    item.calcResult1 = calcPath(item.point1,carPoint);
                    item.calcResult1.align = 'end';
                });

                if(arrayPoint.length == 0){
                    mui.alert('抱歉，无法导航到车辆位置');
                    return;
                }
                arrayPoint = arrayPoint.filter(function(li){
                    return li.calcResult && li.calcResult1;
                });

                arrayPoint.sort(function(a,b){
                    return a.calcResult.length + a.calcResult1.length > b.calcResult.length + b.calcResult1.length ? 1 : -1;
                });

                if(arrayPoint.length){
                    calcResult = arrayPoint[0].calcResult;
                    calcResult1 = arrayPoint[0].calcResult1;
                    calcResult.targetPoint = carPoint;
                    calcResult1.targetPoint = carPoint;
                    setCenterAndZoom(calcResult.minPoint,calcResult.maxPoint,true);
                }else{
                    calcResult = false;
                    calcResult1 = false;
                }
            }else{
                calcResult = false;
                calcResult1 = false;
            }

    //        if(showCalc){
    //            $(".btn_lookcar").addClass('active');
    //        }

        }else{
            calcResult = false;
        }
    }
	drawCanvas();
    if(calcResult1 && showCalc && carPoint.floor == currentFloor){
        setCenterAndZoom(calcResult1.minPoint,calcResult1.maxPoint,true);
    }else if(calcResult && showCalc && currentPoint.floor == currentFloor){
        setCenterAndZoom(calcResult.minPoint,calcResult.maxPoint,true);
    }
    
}

var pathPoints = [];
function addPoint(point){
    point.id = pathPoints.length + 1;
    pathPoints.push(point);
    drawPoint(canvas,point);
}

function createCanvas(parentId){
	var c = document.createElement("canvas");
	c.id = "canvas";
	c.width = data.width*d+200;
	c.height = data.height*d+200;
	c.style.position = "absolute";
	c.style.zIndex = "0";
	c.style.left = "0px";
	c.style.top = "0px";
	c.style.cursor = "crosshair";
	c.style.visibility = "visible";
    
    $("#div_parent").width(c.width);
    $("#div_parent").height(c.height);
    
    var _max = Math.max(c.width,c.height);
    if(_max >= 10000){
        _Draw_Canvas_LineWidth = 0 + (_max / 10000);
    }else{
        _Draw_Canvas_LineWidth = 1;
    }
	return c;
}
function linkFloor(val){
    if(showCalc){
        $("nav item").removeClass('active');
        $(".btn_lookcar").addClass('active');
    }else{
        $("nav item,.btn_lookcar").removeClass('active');
    }
    $('#menu li').removeClass('active');
    $("#menu li[data-floor="+val+"]").addClass('active');
    $("#menu").scrollTop(parseInt($("#menu li[data-floor="+val+"]").css('top')));
	initIndoorMap(val);
	
}

function initControl(){
    var menu = '';
    window._defaultFloor = totalData[0].floor;
    for(var i=0;i<totalData.length;i++){
        if(totalData[i].default){
            window._defaultFloor = totalData[i].floor;
        }
        menu += '<li class="'+(i==0?'active':'')+'" data-floor="'+totalData[i].floor+'">'+totalData[i].floorName+'</li>';
    }
    $('#menu ol').html(menu);

    $('#menu li').each(function(){
       $(this).css('top',$(this).index()*50 + 'px');
       $(this).css('z-index',100-$(this).index());
    });
    
    taps($("#menu li"),function(el){
        var val = el.dataset.floor;
        if(val == currentFloor){
            return false;
        }
        linkFloor(val);
    });
    
    $('#menu').on('touchstart touchmove',function(e){
        e.stopPropagation();
        //e.preventDefault();
    });
    
    if(parkConfig){
        //首次进入弹出图片
        if(parkConfig.url_index){
            $('#index .index').attr('src',parkConfig.url_index);
            
            var _park_config = _GET_DATA(currentParkID);
            if(!_park_config || _park_config.oldIndexImage != parkConfig.url_index){
                $('cover,popup#index').show();
                _SET_DATA(currentParkID,{oldIndexImage:parkConfig.url_index});
            }
            taps($(".znz"),function(){
                $('cover,popup#index').show();
            });
        }
    
        if(parkConfig.wifilocationrefreshinterval && parkConfig.wifilocationrefreshinterval > 0 && parkConfig.wifilocationserver){
            wifilocation();
            setInterval(function(){
                wifilocation();
            },parkConfig.wifilocationrefreshinterval);
        }
    }
 }

//wifi定位
function wifilocation(){
    $.ajax({
        url:parkConfig.wifilocationserver,
        type:'GET',
        data:'',
        success:function(res){
            console.log(res);
            if(res.success){
                setCurrentPoint(res);
            }else{
                mui.alert(res.message);
            }
        },
        error:function(){
            mui.toast(parkConfig.wifilocationunreachable)
        }
    });
}

function setCurrentPoint(point){
    if(point  === false){
        currentPoint = null;
        calcResult = calcResult1 = false;
        autoCalc = showCalc = false;
        linkFloor(currentFloor);
        return;
    }
    if(!point){
        return;
    }
    
    currentPoint = point;
        $('.currentAddress').text(currentPoint.floor + '层');
        $('#info').show();
    
    if(window._el){
        var el = window._el;
        
        if(currentFloor != point.floor){
            return;
        }
        
        autoCalc = false;
        calcResult1 = false;
        showCalc = true;
        var types = el.dataset.type.split(',');
        
        var arrayPoint = data.background.points.filter(function(item){
            return types.indexOf(item.text) > -1;
        });
        
        if(arrayPoint.length == 0){
//            mui.alert('抱歉，本层没有' + el.dataset.text);
            return;
        }
        
        arrayPoint.forEach(function(item,index){
            delete item.calcResult;
            delete item.calcResult1;
        });
        
        if(el.dataset.class == 'shop' || el.dataset.class == 'hotel'){
            var type = 'enter-' + el.dataset.class;
            var html = '';
            arrayPoint.forEach(function(item,index){
                var features = (featureList.filter(function(feature){
                    return feature.featurePoint == item.id && feature.floor == currentFloor;
                }));
                item.types = [];
                features.forEach(function(feature){
                    if(item.types.indexOf(feature.type) == -1){
                        item.types.push(feature.type);
                    }
                });
            });
            arrayPoint = arrayPoint.filter(function(item,index){
                return item.types.indexOf(type) > -1;
            });
            if(arrayPoint.length == 0){
                return;
            }
        }
        
        arrayPoint.forEach(function(item,index){
            item.calcResult = calcPath(currentPoint,item);
        });
        
        arrayPoint.sort(function(a,b){
            return a.calcResult.length > b.calcResult.length ? 1 : -1;
        });
        
        if(arrayPoint.length){
            
            switch(el.dataset.class){
                case 'shop':showType='2';break;
                case 'hotel':showType='2-1';break;
                case 'toll':showType='3';break;
                case 'carexit':showType='4';break;
                case 'toilet':showType='5';break;
                case 'elevator':showType='8';break;
            }
            calcResult = arrayPoint[0].calcResult;
            calcResult.calcType = el.dataset.text;
            setCenterAndZoom(calcResult.minPoint,calcResult.maxPoint,true);
            $('#info').show();
        }
    }else{
        
        if(showType == '7'){
            currentPoint.featurePoint = currentPoint.floor + '-' + currentPoint.x + '-' + currentPoint.y;
        }
        calcResult = calcResult1 = false;
        autoCalc = showCalc = true;
        linkFloor(currentPoint.floor);
    }
    
    
}
 

//获取手机屏幕两个手指之间的中心点
var distancePoint = function(touches){
    if(touches.length>=2){
        var touch = touches[0]; //获取第一个触点
        var x = Number(touch.pageX); //页面触点X坐标
        var y = Number(touch.pageY); //页面触点Y坐标

        var touch1 = touches[1]; //获取第二个触点
        var x1 = Number(touch1.pageX); //页面触点X坐标
        var y1 = Number(touch1.pageY); //页面触点Y坐标
        return Math.pow((x1-x)*(x1-x)+(y1-y)*(y1-y),0.5);
    }
};
//获取室内地图两个手指之间的中心点
var getTwoTouchCenter = function(touches){
    var obj = document.getElementById('div_parent');
    if(touches.length>=2){
        var touch = touches[0]; //获取第一个触点
        x = touch.clientX - obj.offsetLeft;
        y = touch.clientY - obj.offsetTop;

        var touch1 = touches[1]; //获取第二个触点
        x1 = touch.clientX - obj.offsetLeft;
        y1 = touch.clientY - obj.offsetTop;
        var x = (x1-x)/2+x;
        var y = (y1-y)/2+y;
        return {'c_x':x,'c_y':y};
    }
}; 

var centerPoint = function(touches){
    if(touches.length>=2){
        var touch = touches[0]; //获取第一个触点
        var x = Number(touch.pageX); //页面触点X坐标
        var y = Number(touch.pageY); //页面触点Y坐标

        var touch1 = touches[1]; //获取第二个触点
        var x1 = Number(touch1.pageX); //页面触点X坐标
        var y1 = Number(touch1.pageY); //页面触点Y坐标
        var x = (x1-x)/2+x;
        var y = (y1-y)/2+y;
        return {'x':x,'y':y};
    }
}; 

function getSpace(spaceNo){
    var space;
    outerloop:
    for(var i=0;i<totalData.length;i++){
        for(var j=0;j<totalData[i].parks.length;j++){
            if(totalData[i].parks[j].label && totalData[i].parks[j].label.toUpperCase() == spaceNo){
                space = totalData[i].parks[j];
                space.floor = totalData[i].floor;
                break outerloop;
            }
        }
        for(var j=0;j<totalData[i].acc_parks.length;j++){
            if(totalData[i].acc_parks[j].label && totalData[i].acc_parks[j].label.toUpperCase() == spaceNo){
                space = totalData[i].acc_parks[j];
                space.floor = totalData[i].floor;
                break outerloop;
            }
        }
    }
    return space;
}

function getPointByParkingspaceNo(parkingspaceNo){
    var space = getSpace(parkingspaceNo);
    if(space){
        var point = PolygonCenter(space.points);
        return {
            floor:space.floor,
            x:point.x,
            y:point.y,
            name:space.label,
            parkingspace:parkingspaceNo
        };
    }
    return {parkingspace:parkingspaceNo};
}
// 路径遍历计算
// 运行以下代码后 使用 checkPath（10，5）
function checkPath(xCount,yCount){
    var xArr = [];
    var yArr = [];
    var xLength = (data.max.x - data.min.x)/xCount;
    var yLength = (data.max.y - data.min.y)/yCount;
    for(var i=0;i<xCount;i++){
        xArr.push(data.min.x + (xLength*i));
    }
    for(var i=0;i<yCount;i++){
        yArr.push(data.min.y + (yLength*i));
    }
    var points = [];
    for(var i=0;i<xArr.length;i++){
        for(var j = 0;j<yArr.length;j++){
            points.push({x:xArr[i],y:yArr[j]});
        }
    }
    var sCount = 0,fCount = 0;
    for(var i=0;i<points.length;i++){
        for(var j = 0;j<points.length;j++){
            if(i!=j){
                var calcResult = calcPath(points[i],points[j]);
                if(calcResult.success == false || calcResult.path.length <= 1){
                    drawPath(calcResult);
                    console.log(calcResult);
                    fCount ++;
                }else{
                    sCount ++;
                }
            }
        }
    }
    var message = '成功：' + sCount + '  失败：' + fCount;
    alert(message);
}