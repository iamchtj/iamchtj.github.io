
var data,d=1,isClient=true,dis_x=.5,dis_y=.5,drawPosition=true;
var Levels = [0.002,0.0035,0.006,0.009,0.02];
var maxLevel = Levels[Levels.length-1];
var minLevel = Levels[0];
var CurrentLevel = 0;
var currentParkID = request('parkID');
var modelSpace = false;//编辑车位编号模式
var modelSpaceQuick = false;//快速编号模式
var mapUrl = request('map_url');
var nextSpaceCode = {
    first_code : "",
    var_code : "",
    last_code : "",
    varLength: 0,
    var_val:0,
    init: function(first_code,var_code,last_code){
        this.first_code = first_code;
        this.var_code = var_code;
        this.last_code = last_code;

        this.varLength = var_code.length;
        this.var_val = parseInt(var_code);
    },
    getCode: function(){
        return this.first_code + this.leftSpace(this.var_val) + this.last_code;
    },
    nextCode: function(){
        this.var_val ++;
        $('#var_code').val(this.leftSpace(this.var_val));
    },
    leftSpace:function(number){
        number = number.toString();
        for(var i=number.length;i<this.varLength;i++){
            number = "0" + number;
        }
        return number;
    }
};
var _Draw_Canvas_LineWidth = 2;

var currentFloor;
var serverMapPointList = [];//服务器上的地图点和名称
var serverFeatureList = [];
function initCanvas(){
   var w = $("#viewerDiv").width();
   var h = $("#viewerDiv").height();
   var cw = $("#canvas").width();
   var ch = $("#canvas").height();
   var l = (w-cw)/2;
   var t = (h-ch)/2;
   $("#div_parent").css({'left':l+'px','top':t+'px'});
}

$(function(){
    // 测试地图用
    if (mapUrl){
        getData(mapUrl,1,function(res){
            $('loadding').hide();
            totalData = res;
            initControl();
            initIndoorMap(totalData[0].floor);
        });
        initMove();
        return;
    }
    if(!currentParkID){
        alert('没有parkID');
        return
    }
    searchmappoint(currentParkID,function(res){
        serverMapPointList = res.data.mapPointList;
        initData();
	    initCanvas();
    });
    initMove();
});

var totalData;
function initData(){
    package(currentParkID,function(res){
        if(!res.data.map_url){
            $('loadding').text('该车场暂无地图数据');
            return;
        }
        getData(res.data.map_url,res.data.map_md5,function(res){
            $('loadding').hide();
            totalData = res;
            searchfeature({
                parkID:currentParkID
            },function(searchfeaturedata){
                serverFeatureList = searchfeaturedata.data.featureList;
//                serverFeatureList.forEach(function(item){
//                    if(item.type == '' || item.type.indexOf('space') == 0){
//                        removefeature(item.featureID,function(){delete item.featureID;});
//                    }
//                })
                initControl();
                initIndoorMap(totalData[0].floor);
            });
        });
    });
}


//绘制地图计数，用于异步绘图时的过期验证
var _Draw_Canvas_Counter = 0;
//画地图方法
var qrPointList,mapPointList;
function drawCanvas(){
    var c = canvasCenter();
    var div_parent = document.getElementById('div_parent');
         $("canvas").remove("#canvas");
         var canvas = createCanvas();
         div_parent.appendChild(canvas);


	for(var i=0;i<data.background.lines.length;i++){
		drawPolyline(canvas,data.background.lines[i]);
	}

	for(var i=0;i<data.background.arcs.length;i++){
		drawArc(canvas,data.background.arcs[i]);
	}

	for(var i=0;i<data.background.polygons.length;i++){
		drawPolygon(canvas,data.background.polygons[i]);
	}

	for(var i = 0;i<data.parks.length;i++){
        var park = data.parks[i];
        if(!park.id){
            park.center = PolygonCenter(park.points);
            park.namexy = park.center.x + ',' + park.center.y;
            park.id = data.floor + '-' + park.center.x + '-' + park.center.y;
            park.floor = data.floor;
            park.type = 'space-normal';
            park.flag = 3;
        }
        if(!park.featureID){
            serverFeatureList.forEach(function(item){
                if(item.featurePoint == park.id){
//                        removefeature(park.featureID,function(){delete park.featureID;});
                    park.name = item.name;
                    park.featureID = item.featureID;
                    park.existSpace = item.existSpace;
                    if(park.existSpace == 1){
                        park.flag = 2;
                    }else{
                        park.flag = 3;
                    }
                }
            });
        }
        
		drawPark(canvas,data.parks[i]);
	}

	for(var i = 0;i<data.acc_parks.length;i++){
        var park = data.acc_parks[i];
        if(!park.id){
            park.center = PolygonCenter(park.points);
            park.namexy = park.center.x + ',' + park.center.y;
            park.id = data.floor + '-' + park.center.x + '-' + park.center.y;
            park.floor = data.floor;
            park.type = 'space-acc';
            park.flag = 3;
        }
        if(!park.featureID){
            serverFeatureList.forEach(function(item){
                if(item.featurePoint == park.id){
                    park.name = item.name;
                    park.featureID = item.featureID;
                    park.existSpace = item.existSpace;
                    if(park.existSpace == 1){
                        park.flag = 2;
                    }else{
                        park.flag = 3;
                    }
                }
            });
        }
		drawPark(canvas,data.acc_parks[i]);
	}

    mapPointList = [];
	for(var i = 0;i<data.background.points.length;i++){
        var bgPoint = data.background.points[i];
        serverMapPointList.forEach(function(item){
            if(item.floor == data.floor && item.id == bgPoint.id){
                bgPoint.name = item.name;
            }
        });
		drawImage(canvas,bgPoint,_Draw_Canvas_Counter,CurrentLevel);
	}


        var p = $("#pop").position();
        var ds = canvasCenter();
        setCenter(c,ds);

    if(request('debug') == 'true'){
        //绘制行车路线
        for(var i=0;i<data.path.points.length;i++){
            drawNumber(canvas,data.path.points[i]);
        }
        var ctx=canvas.getContext("2d");
        for(var i=0;i<data.path.lines.length;i++){
            var a = getPoint(data.path.lines[i].a,data.path.points);
            var b = getPoint(data.path.lines[i].b,data.path.points);
            ctx.beginPath();
            drawMoveTo(ctx,a);
            drawLineTo(ctx,b);
            ctx.strokeStyle=data.path.lines[i].c == 1 ? "red":"green";
            ctx.stroke();
        }
    }
    


        var ctx=canvas.getContext("2d");

        function drawQr(list){
            preImage("img/icon_qr.png",function(){
                var h = this.height;
                var w = this.width;
                if(!CurrentLevel){
                    return;
                }
                for(var i=0;i<list.length;i++){
                    var point = list[i];
                    if(point.floor != currentFloor){
                        continue;
                    }
                    ctx.drawImage(this,js_x(point.x)-w/2,js_y(point.y)-h/2,w,h);
                    point.type = 'qr';
                    point.ploygon = [];
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)-h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)+(w/2)),y:y_js(js_y(point.y)-h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)+(w/2)),y:y_js(js_y(point.y)+h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)+h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)-h/2)});

                }
            });
        }
        if(qrPointList){
            drawQr(qrPointList);
        }else{

            pointlist(currentParkID,function(list){
                qrPointList = list;

                drawQr(qrPointList);
            });
        }

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
            executefunc();
            
            $('#pop,#pop_qr').hide();
        }
    }
}
function executefunc(){
    Levels = data.levels_pc;
    data.width=data.max.x-data.min.x;
	data.height=data.max.y-data.min.y;
	dw=($("#viewerDiv").width()-200)/data.width;
	dh=($("#viewerDiv").height()-200)/data.height;
	if(dw<=dh) d=dw; else d=dh;
	minLevel=d;
    CurrentLevel = 0;
    Levels[0] = d;
	drawCanvas();
}

var tempPoint;
var tempQRPoint;
var tempFeaturePoint;
var tempFeatureItemPoint;
var tempFeatureType;
var tempSpace;
function initMove(){
        var dragging = false;
        var iX=0, iY=0,x_=0,y_=0,p;
        var position = $('#position');
        var $space_new_code = $("#space_new_code");
        document.getElementById("div_parent").onmousedown =function(e) {
            dragging = true;
            iX = e.clientX - this.offsetLeft;
            iY = e.clientY - this.offsetTop;
            x_ = e.clientX;y_ = e.clientY;
            p = $("#pop").position();
            this.setCapture && this.setCapture();
            return false;
        };
        document.getElementById("pop").onmousedown =function(e) {
            dragging = false;
            e.stopPropagation();
            //return false;
        };
        document.getElementById("pop_space").onmousedown =function(e) {
            dragging = false;
            e.stopPropagation();
            //return false;
        };

        document.onmousemove = function(ev) {
            var e = ev || window.event;
            var oX = e.clientX - iX;
            var oY = e.clientY - iY;
            if (dragging) {
                $("#div_parent").css({"left":oX + "px", "top":oY + "px"});
                //$("#pop").css({'left':(p.left+e.clientX-x_),'top':(p.top+e.clientY-y_)});
                return false;
            }
            var x = x_js(e.clientX-document.getElementById("div_parent").offsetLeft);
            var y = y_js(e.clientY-document.getElementById("div_parent").offsetTop);
            position.html(
                'x:'+parseInt(x)+' ,y:'+parseInt(y)+'<br>'+
                'x:'+parseInt(js_x(x))+' ,y:'+parseInt(js_y(y))
                         );
            if(modelSpaceQuick){
                $space_new_code.css({position: "absolute",'left':(js_x(Number(x))) + 20,'top':(js_y(Number(y))) + 10});
            }
        };

        document.onmouseup = function(e) {

            dragging = false;
            if(e.clientX-x_<1&&e.clientX-x_>-1&&e.clientY-y_<1&&e.clientY-y_>-1){//判断是移动还是点击
                //judgePoint({'x':iX,'y':iY});
                //addPoint({'x':iX,'y':iY});
                var point = {'x':parseInt(x_js(iX)),'y':parseInt(y_js(iY))};
                
                if(modelSpaceQuick){
                    if(tempSpace){
                        tempSpace.selected = false;
                    }
                    tempSpace = checkSpace(point);
                    if(tempSpace){
                        tempSpace.name = nextSpaceCode.getCode();
                        nextSpaceCode.nextCode();
                        $space_new_code.text(nextSpaceCode.getCode());
                        if(tempSpace.featureID){
                            updatefeaturename(tempSpace,function(res){
                                if(res.success){
                                    tempSpace.existSpace = res.data.existSpace;

                                    if(tempSpace.existSpace == 1){
                                        tempSpace.flag = 2;
                                    }else{
                                        tempSpace.flag = 3;
                                    }
                                    drawCanvas();
                                }else{
                                    alert(res.message);
                                }
                            });
                        }else{
                            tempSpace.parkID = currentParkID;
                            tempSpace.featurePoint = tempSpace.id;
                            addfeature(tempSpace,function(res){
                                if(res.success){
                                    tempSpace.featureID = res.data.featureID;
                                    tempSpace.existSpace = res.data.existSpace;

                                    if(tempSpace.existSpace == 1){
                                        tempSpace.flag = 2;
                                    }else{
                                        tempSpace.flag = 3;
                                    }
                                    drawCanvas();
                                }else{
                                    alert(res.message);
                                }
                            });
                        }
                    }else{
                        $('#pop_qr,#pop,#pop_space').hide();
                    }
                    
                }else if(modelSpace){
                    
                    if(tempSpace){
                        tempSpace.selected = false;
                    }
                    tempSpace = checkSpace(point);
                    if(tempSpace){
                        
                        tempSpace.selected = true;
                        $('#pop_space').show();
                        $('#pop_qr,#pop').hide();
                        $("#pop_space").css({position: "absolute",'left':js_x(Number(tempSpace.center.x)),'top':js_y(Number(tempSpace.center.y)) - 125});
                        if(tempSpace.name){
                            $('#pop_space_name').val(tempSpace.name);
                            $('#pop_space_state').text(tempSpace.existSpace?"已关联":"未关联");
                        }else if(tempSpace.label){
                            $('#pop_space_name').val(tempSpace.label);
                            $('#pop_space_state').text('');
                        }else{
                            $('#pop_space_name').val('');
                            $('#pop_space_state').text('');
                        }
                    }else{
                        $('#pop_qr,#pop,#pop_space').hide();
                    }
                    drawCanvas();
                     
                }else{
                    var qrpoint = judgePoint(point);
                    if(qrpoint && qrpoint.type == 'qr'){
                        tempQRPoint = qrpoint;
                        $('#pop_qr').show();
                        $('#pop').hide();
                        $('#pop_qr_name').text(qrpoint.pointName);
                        $('#pop_qr_xy').text('x:'+parseInt((qrpoint.x)) + ' y:'+parseInt((qrpoint.y)));
                        $('#pop_qrcode').attr('src',qrpoint.url);
                        $("#pop_qr").css({position: "absolute",'left':(js_x(Number(point.x)))- 88,'top':(js_y(Number(point.y))) - 287});
                    }else if(qrpoint && qrpoint.type == 'enter-shop'){
                        tempFeaturePoint = qrpoint;
                        tempFeaturePoint.parkID = currentParkID;
                        tempFeaturePoint.featurePoint = qrpoint.id;
                        tempFeaturePoint.floor = currentFloor;
                        $('popup').hide();
                        $('cover,popup.featureList').show();
                        $('#pop').hide();
                        $('popup.featureList .title.label').removeClass('pending');
                        $('popup.featureList .title.label').text(qrpoint.name || "未命名");
                        $('popup.featureList ul').html('<li>加载中...</li>');
                        loadFeatureList(tempFeaturePoint);
                    }else{
                        draw(point);
                        tempPoint = point;
                        tempPoint.floor = currentFloor;
                    }

                }
                
            }
            e.cancelBubble = true;
        };

        if(document.addEventListener){
           document.addEventListener('DOMMouseScroll',mouseWheel,false);
         };
        window.onmousewheel=document.getElementById("canvas").onmousewheel=mouseWheel;
    $('#pop_space_save').click(function(){
        tempSpace.name = $('#pop_space_name').val();
        tempSpace.parkID = currentParkID;
        tempSpace.featurePoint = tempSpace.id;
        if(tempSpace.featureID){
            updatefeaturename(tempSpace,function(res){
                if(res.success){
                    $('#pop_space').hide();
                    $('#pop_space_name').val('');
                    tempSpace.existSpace = res.data.existSpace;

                    if(tempSpace.existSpace == 1){
                        tempSpace.flag = 2;
                    }else{
                        tempSpace.flag = 3;
                    }
                    drawCanvas();
                }else{
                    alert(res.message);
                }
            });
        }else{
            addfeature(tempSpace,function(res){
                if(res.success){
                    $('#pop_space').hide();
                    $('#pop_space_name').val('');
                    tempSpace.featureID = res.data.featureID;
                    tempSpace.existSpace = res.data.existSpace;

                    if(tempSpace.existSpace == 1){
                        tempSpace.flag = 2;
                    }else{
                        tempSpace.flag = 3;
                    }
                    drawCanvas();
                }else{
                    alert(res.message);
                }
            });
        }
        
    });
    $('#pop_btn_save').click(function(){
        tempPoint.pointName = $('#pop_name').val();
        tempPoint.parkID = currentParkID;
        addQRPoint(tempPoint,function(res){
            if(res.success){
                $('#pop').hide();
                $('#pop_name').val('');
                tempPoint.url = res.data.url;
                tempPoint.pointID = res.data.pointID;

                preImage("img/icon_qr.png",function(){
                    var h = this.height;
                    var w = this.width;
                    var ctx=canvas.getContext("2d");
                    ctx.drawImage(this,js_x(tempPoint.x)-w/2,js_y(tempPoint.y)-h/2,w,h);
                    tempPoint.type = 'qr';
                    tempPoint.ploygon = [];
                    tempPoint.ploygon.push({x:x_js(js_x(tempPoint.x)-(w/2)),y:y_js(js_y(tempPoint.y)-h/2)});
                    tempPoint.ploygon.push({x:x_js(js_x(tempPoint.x)+(w/2)),y:y_js(js_y(tempPoint.y)-h/2)});
                    tempPoint.ploygon.push({x:x_js(js_x(tempPoint.x)+(w/2)),y:y_js(js_y(tempPoint.y)+h/2)});
                    tempPoint.ploygon.push({x:x_js(js_x(tempPoint.x)-(w/2)),y:y_js(js_y(tempPoint.y)+h/2)});
                    tempPoint.ploygon.push({x:x_js(js_x(tempPoint.x)-(w/2)),y:y_js(js_y(tempPoint.y)-h/2)});

                    qrPointList.push(tempPoint);
                });
            }else{
                alert(res.message);
            }
        });
    });
    $('#pop_btn_del').click(function(){
        if(confirm('确定要删除' + tempQRPoint.pointName +'吗？')){
            delQRPoint(tempQRPoint.pointID,function(res){
                if(res.success){
                    qrPointList = null;
                    drawCanvas();
                    $('#pop,#pop_qr').hide();
                }else{
                    alert(res.message);
                }
            });
        }

    })
}
function uninitMove(){
    document.getElementById("div_parent").onmousedown =function(e) {}
    document.onmousemove = function(ev) {}
    document.onmouseup = function(e) {}
}
var pathPoints = [];
function addPoint(point){
    point.id = pathPoints.length + 1;
    pathPoints.push(point);
    drawPoint(canvas,point);
}
var mouseWheel=function(e){
     var direct=0;
     e=e || window.event;

     iX = e.clientX;
     iY = e.clientY;
     var wheel;
     if(e.wheelDelta){//IE/Opera/Chrome
         wheel = e.wheelDelta;
     }else if(e.detail){//Firefox
         wheel = e.detail;
     }
     if(wheel<0){d=d*1.5;if(d>maxLevel){d=maxLevel;}}
     if(wheel>0){ d=d/1.5;if(d<minLevel){d=minLevel;}}
     drawCanvas();
    if(tempPoint){
        $("#pop").css({'left':Number(js_x(tempPoint.x)),'top':Number(js_y(tempPoint.y)) - 125});
    }
    if(tempQRPoint){
        $("#pop_qr").css({'left':Number(js_x(tempQRPoint.x)) - 88,'top':Number(js_y(tempQRPoint.y)) - 287});
    }

}
//判断坐标在哪个poi中
function judgePoint(point){
    if (qrPointList)
    for(var i = 0;i<qrPointList.length;i++){
        var qrpoint = qrPointList[i];
        if(qrpoint.floor == currentFloor && checkPP(point,qrpoint.ploygon)){
            return qrpoint;
        }
    }
    if (mapPointList)
    for(var i = 0;i<mapPointList.length;i++){
        var qrpoint = mapPointList[i];
        if(checkPP(point,qrpoint.ploygon)){
            return qrpoint;
        }
    }
    return false;
}

//判断点是否在某个车位内
function checkSpace(point){
    for(var i=0;i<data.parks.length;i++){
        var park = data.parks[i];
        
        if(checkPP(point,park.points)){
            return park;
        }
    }
    for(var i=0;i<data.acc_parks.length;i++){
        var park = data.acc_parks[i];
        if(checkPP(point,park.points)){
            return park;
        }
    }
    return false;
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
	c.style.cursor = modelSpaceQuick ? "copy" : "crosshair";
	c.style.visibility = "visible";
	return c;
}
function linkFloor(val){
	initIndoorMap(val);
	initCanvas();
}

function loadFeatureList(tempFeaturePoint){
    searchfeature({
        parkID:currentParkID,
        featurePoint:tempFeaturePoint.featurePoint,
        floor:tempFeaturePoint.floor
    },function(res){
        var html = ''
        var list = res.data.featureList;
        for(var i=0;i<list.length;i++){
            var item = list[i];
            var type = '未知';
            if(item.type == 'enter-shop'){
                type = '商场';
            }
            if(item.type == 'enter-hotel'){
                type = '公寓';
            }
            html +='<li data-item="'+encodeURIComponent(JSON.stringify(item))+'">\
                        <div class="name">'+item.name+' ['+type+']</div>\
                        <button class="del">删除</button>\
                        <button class="edit">编辑</button>\
                    </li>';
        }
        $('popup.featureList ul').html(html);

        $('popup.featureList ul button.edit').bind('click',function(){
            var item = JSON.parse(decodeURIComponent($(this).parents('li').attr('data-item')));
            tempFeatureItemPoint = item;
            tempFeatureType = 2;
            $('input[type=radio]').removeAttr('checked');
            $('input[type=radio][value='+tempFeatureItemPoint.type+']')[0].checked = true;
            $('div.add #name').val(tempFeatureItemPoint.name);
            $('div.add').show();
            $('div.add #name').focus();
        });
        $('popup.featureList ul button.del').bind('click',function(){
            var item = JSON.parse(decodeURIComponent($(this).parents('li').attr('data-item')));
            removefeature(item.featureID,function(){
                loadFeatureList(tempFeaturePoint);
            });
        });
    });
}
function initControl(){
   var menu = '';
    for(var i=0;i<totalData.length;i++){
        menu += '<li class="'+(i==0?'active':'')+'" data-floor="'+totalData[i].floor+'"><div class="button">'+totalData[i].floor+'</div></li>';
    }
    $('#menu ol').html(menu);
    
   $('#menu li').each(function(){
       $(this).css('top',$(this).index()*36 + 'px');
       $(this).css('z-index',100-$(this).index());
   });
    $("#zoomIn").click(function(){
	    if(CurrentLevel < Levels.length - 1){
            CurrentLevel ++;
            d = Levels[CurrentLevel];
            drawCanvas();
            if(tempPoint){
                $("#pop").css({'left':Number(js_x(tempPoint.x)),'top':Number(js_y(tempPoint.y)) - 125});
            }
            if(tempQRPoint){
                $("#pop_qr").css({'left':Number(js_x(tempQRPoint.x)) - 88,'top':Number(js_y(tempQRPoint.y)) - 287});
            }
        }
	});
	$("#zoomOut").click(function(){
	    if(CurrentLevel > 0){
            CurrentLevel --;
            d = Levels[CurrentLevel];
            drawCanvas();
            if(tempPoint){
                $("#pop").css({'left':Number(js_x(tempPoint.x)),'top':Number(js_y(tempPoint.y)) - 125});
            }
            if(tempQRPoint){
                $("#pop_qr").css({'left':Number(js_x(tempQRPoint.x)) - 88,'top':Number(js_y(tempQRPoint.y)) - 287});
            }
        }
	});

     //=======================================选择楼层效果===========================================
     $("#menu li").click(function(){
         $('#menu li').removeClass('active');
         $(this).addClass('active');
         linkFloor($(this).attr('data-floor'));
     });

    $('#downQRList').bind('click',function(){
        downQRList(currentParkID);
    });
    
    
    //启用/禁用编辑车位模式
    $('#enabledSpaceNo').bind('click',function(){
        modelSpace = !modelSpace;
        if(modelSpace){
            this.innerText = '停止车位关联'
        }else{
            this.innerText = '开始车位关联';
            if(tempSpace){
                tempSpace.selected = false;
                tempSpace.flag = 3;
            }
            drawCanvas();
        }
        $('.pop').hide();
    });
    
    //显示快速编号确认框
    $('#enabledQuickCode').bind('click',function(){
        $('popup').hide();
        $('cover,popup.SpaceCodeStart').show();
    });
    
    //结束快速编号
    $('#disabledQuickCode').bind('click',function(){
        modelSpaceQuick = false;
        $('#enabledQuickCode').show();
        $(this).hide();
        $('#space_new_code').hide();
        $('#enabledSpaceNo').removeAttr('disabled');
        drawCanvas();
    });
    
    //开始快速编号
    $('popup.SpaceCodeStart .btn_start').bind('click',function(){
        nextSpaceCode.init($("#first_code").val(),$("#var_code").val(),$("#last_code").val());
        modelSpaceQuick = true;
        $('#space_new_code').text(nextSpaceCode.getCode());
        $('#space_new_code,#disabledQuickCode').show();
        
        $('#enabledSpaceNo').attr('disabled',true);
        $('cover,popup,#enabledQuickCode').hide();
        drawCanvas();
    });

    $('popup.featureList button.add').bind('click',function(){
        $('div.add').show();
        $('div.add #name').focus();
        tempFeatureType = 1;
    });
    $('popup.featureList .add .btn_cancel').bind('click',function(){
        $('div.add').hide();
        $('div.add #name').val('');
    });
    $('popup.featureList .add .btn_save').bind('click',function(){
        if(tempFeatureType == 1){
            tempFeaturePoint.name = $('div.add #name').val();
            tempFeaturePoint.type = $('input[type=radio]:checked').val();
            addfeature(tempFeaturePoint,function(){
                $('div.add').hide();
                $('div.add #name').val('');
                loadFeatureList(tempFeaturePoint);
            });
        }else if(tempFeatureType == 2){
            tempFeatureItemPoint.name = $('div.add #name').val();
            tempFeatureItemPoint.type = $('input[type=radio]:checked').val();
            updatefeaturename(tempFeatureItemPoint,function(){
                $('div.add').hide();
                $('div.add #name').val('');
                loadFeatureList(tempFeaturePoint);
            });
        }

    });
    $('popup .close').bind('click',function(){
        $('cover,popup').hide();
    });

    $('popup.featureList .title.label').dblclick(function(){
        $(this).hide();
        $('popup.featureList .title input').val(this.innerText);
        $('popup.featureList .title.input').show();
        $('popup.featureList .title input').focus();
    });
    $('popup.featureList .title input').bind('blur keydown',function(){

        if(event.type == 'keydown' && event.keyCode == 27){
            $('popup.featureList .title input').val($('popup.featureList .title.label').text());
            $(this).blur();
            return;
        }
        if(event.type == 'blur' || (event.type == 'keydown' && event.keyCode == 13)){
            $('popup.featureList .title.input').hide();
            $('popup.featureList .title.label').show();

            if($('popup.featureList .title.label').text() == $('popup.featureList .title input').val()){
                return;
            }
            $('popup.featureList .title.label').addClass('pending')
            $('popup.featureList .title.label').text($('popup.featureList .title input').val());
            var para = {parkID:currentParkID,floor:currentFloor,id:tempFeaturePoint.featurePoint,name:$('popup.featureList .title input').val()};

            //保存修改
            savemappoint(para,function(){
                $('popup.featureList .title.label').removeClass('pending');
                var mapPoint = serverMapPointList.filter(function(item){
                    return (item.floor == currentFloor && item.id == tempFeaturePoint.featurePoint);
                });
                if(mapPoint.length){
                    mapPoint[0].name = $('popup.featureList .title input').val();
                }else{
                    serverMapPointList.push(para);
                }

            });
        }

    });
 }

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
                if(calcResult.success == false){
                    drawPath(calcResult);
                    console.log(calcResult);
                    fCount ++;
                }else{
                    sCount ++;
                }
            }
        }
    }
    console.log('成功：' + sCount + '  失败：' + fCount);

}
