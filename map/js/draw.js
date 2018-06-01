var _Draw_Canvas_LineWidth = 1;
var ds;
//绘制多义线
function drawPolyline(canvas,one){
	var points = one.points;
	var style = one.style;
	var context = canvas.getContext("2d");
	context.strokeStyle = one.color || "grey";//style.color;
	context.lineWidth = 0.4 * _Draw_Canvas_LineWidth;//style.width;
	context.beginPath();
	drawMoveTo(context,points[0]);
	for(var n=1;n<points.length;n++){
		drawLineTo(context,points[n]);
	}
//	if(one.closed && one.color){
//		drawLineTo(context,points[0]);
//        context.strokeStyle = one.color;
//        context.fill();
//	}
	context.stroke();
}

//绘制圆弧
function drawArc(canvas,one){
	var style = one.style;
	var context = canvas.getContext("2d");
	context.strokeStyle = "grey";//style.color;
	context.lineWidth = 0.4 * _Draw_Canvas_LineWidth;//style.width;
	context.beginPath();
	//js和cad的角度正好相反
	context.arc(js_x(one.x),js_y(one.y),one.r*d,-one.s,-one.e,true);
	context.stroke();
}

//绘制面
function drawPolygon(canvas,one){
    if(!one.points || one.points.length < 3){
        return;
    }
	var context = canvas.getContext("2d");
	//context.strokeStyle = one.stroke;
	context.fillStyle = one.stroke || (one.isPark ? '#32c93288' : '#e11922');//dat.fill;//#f5aa53';
    context.lineWidth=0 * _Draw_Canvas_LineWidth;
    context.strokeStyle =one.isPark ? '#e8e8e8' : 'grey';
    
    //已关联
	if(one.flag==2){
		context.fillStyle ='#32c93288';
        //已选中
        if(one.selected){
            //context.lineWidth = 2;
            context.fillStyle ='#739153';
        }
	}
    //未关联
	if(one.flag==3){
		context.fillStyle ='#e8c9b8';
        //已选中
        if(one.selected){
            //context.lineWidth = 2;
            context.fillStyle ='#946f5a';
        }
	}
    context.strokeStyle = context.fillStyle;
	
	var points = one.points;
	var polygon = new Array();
	context.beginPath();
	drawMoveTo(context,points[0]);
	polygon.push({'x':js_x(points[0]),'y':js_y(points[0])});
	for(var n=1;n<points.length;n++){
		drawLineTo(context,points[n]);
		polygon.push({'x':js_x(points[n]),'y':js_y(points[n])});
	}
	drawLineTo(context,points[0]);
	polygon.push({'x':js_x(points[0]),'y':js_y(points[0])});
	one.polygon=polygon;
	if(one.stroke != 'null'){
		context.stroke();
	}
	context.fill();
}

function drawPark(canvas,one){
    one.isPark = true;
	drawPolygon(canvas,one);
    var width = Math.abs(one.points[0].x - one.points[2].x);
    var height = Math.abs(one.points[0].y - one.points[2].y);
	if(one.name || one.label){
        var center = {
            x:one.center.x,
            y:one.center.y
        };
        if(one.namexy){
            var xy = one.namexy.split(',');
            center = {
                x: xy[0],
                y: xy[1]
            }
        }
		
		var t = {'text':(one.name || one.label),'x':center.x,'y':center.y,'polygon':one.points};
		drawText(canvas,t,false,width < height);
	}
}

function drawLineTo(context,a) {
	context.lineTo(js_x(a.x),js_y(a.y));
}

function drawMoveTo(context,a){
	context.moveTo(js_x(a.x),js_y(a.y));
}
function drawBezier(context,a) {
    context.bezierCurveTo(a[0]*d,a[1]*d,a[2]*d, a[3]*d,a[4]*d,a[5]*d);
}

function drawPoint(canvas,a){
    var cxt = canvas.getContext("2d");
    cxt.fillStyle = "#000";
    cxt.textAlign = 'center';

    var fn =a.id, fx = js_x(a.x), fy = js_y(a.y);
    var fsize = cxt.measureText(fn).width;
    cxt.font = "small-caps italic 600 14px simsun menu";// Arial   simsun
    if(isClient){
        cxt.font = "small-caps italic 700 30px simsun menu";
        if(fsize>100&&fsize<150){
            cxt.font = "small-caps italic 700 20px simsun menu";
        }else if(fsize>150){
            cxt.font = "small-caps italic 700 15px simsun menu";
        }
    }
    cxt.fillText(fn,fx,fy);
}

//绘制文本(x,y,text,polygon)
function drawText(canvas,a,impoartant,rotate, offset){
	if(a.text!=''){
        var text = a.text.split("-").length>1?a.text.split("-")[1]:a.text;
		var cxt = canvas.getContext("2d");
		cxt.fillStyle = "#000";
		cxt.textAlign = 'center';
		var fn = text, fx = js_x(a.x), fy = js_y(a.y);
		var polygon = [];
        var bool0,bool1;
        if(a.polygon && a.polygon.length){
            a.polygon.forEach(function(item){
                polygon.push({x:js_x(item.x),y:js_y(item.y)});
            });
        }
        
        
		var fsize = cxt.measureText(fn).width;
		cxt.font = "small-caps italic 600 12px simsun menu";// Arial   simsun
		if(isClient){
			cxt.font = "small-caps italic 700 12px simsun menu";
			if(fsize>100&&fsize<150){
				cxt.font = "small-caps italic 700 20px simsun menu";
			}else if(fsize>150){
				cxt.font = "small-caps italic 700 15px simsun menu";
			}
		}
		if(isMobile){
            if(fn.lastIndexOf('0') == 3 || fn.lastIndexOf('2') == 3 || fn.lastIndexOf('4') == 3 || fn.lastIndexOf('6') == 3 || fn.lastIndexOf('8') == 3 ){
                if(CurrentLevel > 1)
                    impoartant = true;
            }
			cxt.font = "small-caps 700 20px simsun menu";
		}
		fsize = cxt.measureText(fn).width;
		
        var poi0 = {'x':fx-fsize/2,'y':fy-fsize/2};
		var poi1 = {'x':fx+fsize/2,'y':fy+fsize/2};
        if(polygon && polygon.length > 2){
            bool0 = checkPP(poi0,polygon);
            bool1 = checkPP(poi1,polygon);
        }
        if(impoartant && offset){
            fy += offset;
        }
		if((bool0&&bool1) || impoartant ){
			//cxt.strokeText(fn,fx,fy);
            cxt.textBaseline="middle";
            if(rotate){
                cxt.save();
                cxt.translate(fx,fy);
                cxt.rotate(90*Math.PI/180);
                cxt.translate(-fx,-fy);
                cxt.fillText(fn,fx,fy);
                cxt.restore();
            }else{
                cxt.fillText(fn,fx,fy);
            }
            
		}
	}
}

//绘制节点编号
function drawNumber(canvas,a){
	var cxt = canvas.getContext("2d");
	cxt.fillStyle = "#000";
	cxt.textAlign = 'center';

    var fn=a.id+'('+a.num+')', fx=js_x(a.x), fy=js_y(a.y);
    if(a.num < 2){
        cxt.fillStyle = 'red';
    }
	var fsize = cxt.measureText(fn).width;
	cxt.font = "small-caps italic 600 14px simsun menu";// Arial   simsun
	if(isClient){
		cxt.font = "small-caps italic 700 18px simsun menu";
		if(fsize>100&&fsize<150){
			cxt.font = "small-caps italic 700 20px simsun menu";
		}else if(fsize>150){
			cxt.font = "small-caps italic 700 15px simsun menu";
		}
    }
    cxt.fillText(fn,fx+fsize/2,fy+12);
}

function drawImage(canvas,point,draw_counter,showName){
	cxt = canvas.getContext("2d");
	if(point.text){
		var fn=point.text, fx=js_x(point.x), fy=js_y(point.y);

		var h = 4000*d;
		if(h<10){h = 10;};if(h>80){h = 80;};
        var w = h;
        if (fn == "text") {
            drawText(canvas,{text:point.name,x:point.x,y:point.y},true, 0,w/2+8);
            return;
        }
		preImage("png/"+fn+".png",function(){
            if(!draw_counter || draw_counter == _Draw_Canvas_Counter){
                cxt.drawImage(this,fx-h/2,fy-h/2,h,h);

                if(typeof(mapPointList) != "undefined"){
                    point.type = 'enter-shop';
                    point.ploygon = [];
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)-h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)+(w/2)),y:y_js(js_y(point.y)-h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)+(w/2)),y:y_js(js_y(point.y)+h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)+h/2)});
                    point.ploygon.push({x:x_js(js_x(point.x)-(w/2)),y:y_js(js_y(point.y)-h/2)});
                    mapPointList.push(point);
                }

            }
            // 加载图片是异步处理，在成功回调后绘制文字
            if(showName){
                drawText(canvas,{text:point.name,x:point.x,y:point.y},true, 0,w/2+16);
            }
		});

	}

}

function preImage(url,callback){
     var img = new Image(); //创建一个Image对象，实现图片的预下载
     img.src = url;

     if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
         callback.call(img);
        return; // 直接返回，不用再处理onload事件
     }

     img.onload = function () { //图片下载完毕时异步调用callback函数。
         callback.call(img);//将回调函数的this替换为Image对象
     };
}

//CAD转Canvas
function js_x(x){
	return (x-data.min.x)*d+100;
}


//Canvas转CAD
function x_js(x){
    return data.min.x + (x-100)/d;
}
function js_y(y){
	return (data.max.y-y)*d+100;
}
function y_js(y){
    return data.max.y - (y-100)/d;
}



function getData(url,md5,func){
    var old_md5 = _GET_DATA('md5');
    var data = _GET_DATA('data');
    if(md5 == old_md5 && data){
        eval(func)(data);
        return;
    }
    var progress = $('loadding span');
    $.ajax({
        url:url,
        type:'GET',
        dataType:'text',
        xhr:function(){
            var xhr = $.ajaxSettings.xhr();
            //绑定上传进度的回调函数
            xhr.onprogress = function(e){
                var p = parseInt(e.loaded/e.total*100);
                if(isNaN(p)){
                    progress.text('初始化');
                }else{
                    progress.text(parseInt(e.loaded/e.total*100) + "%");
                }
                
            }
            return xhr;//一定要返回，不然jQ没有XHR对象用了
        },
        success:function(data){
            progress.text("...");
            if(typeof(data) == "string"){
                data = eval('('+data+')');
            }
            _SET_DATA('data',data);
            _SET_DATA('md5',md5);
            eval(func)(data);
        },
        error:function(res){
            console.log(res);
        }
    });
}

//获取canvas地图的中心点
function canvasCenter(){
    var p_x = $("#div_parent").position().left;
    var p_y = $("#div_parent").position().top;
    var c_x = $("#canvas").width();
    var c_y = $("#canvas").height();
    return {'c_x':(p_x+c_x*dis_x),'c_y':(p_y+c_y*dis_y)};
}
//设置变化后地图的位置
function setCenter(c,d){
    var dx = d.c_x-c.c_x;
    var dy = d.c_y-c.c_y;
    var p_x = $("#div_parent").position().left;
    var p_y = $("#div_parent").position().top;
    $("#div_parent").css('left',(p_x-dx)+'px');
    $("#div_parent").css('top',(p_y-dy)+'px');
}
function setCenterAndZoom(a,b,refresh){

    if(b){
        var _d_w = $("#viewerDiv").width() / Math.abs(a.x - b.x);
        var _d_h = ($("#viewerDiv").height()-188) / Math.abs(a.y - b.y);
        var _d = Math.min(_d_w,_d_h);
        for(var i=0;i<Levels.length;i++){
            if(_d > Levels[i]){
                CurrentLevel = i;
            }
        }
    }else{
        CurrentLevel = Levels.length - 1;
    }


    d = Levels[CurrentLevel];
    refresh && drawCanvas();



    //求出2点的中心点。 当前为CAD坐标系
    var ab = b ? {x:Math.abs(a.x-b.x)/2+Math.min(a.x,b.x),y:Math.abs(a.y-b.y)/2+Math.min(a.y,b.y)} : a;

    //获取CAD坐标系点在屏幕坐标系中的点。  当前为屏幕坐标系
    var point = {x:js_x(ab.x),y:js_y(ab.y)}

    //获取屏幕中心点
    var center = {x:($("#viewerDiv").width()/2),y:($("#viewerDiv").height()-188)/2};
    var obj = document.getElementById('div_parent');
    dx = -point.x + center.x;
    dy = -point.y + center.y;


    obj.style.left = (dx) + 'px';
    obj.style.top = (dy) + 'px';
}

//动态设置屏幕和画布的分辨率
function con(canvas, cxt) {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var backingStorePixelRatio = cxt.webkitBackingStorePixelRatio ||
                                 cxt.mozBackingStorePixelRatio ||
                                 cxt.msBackingStorePixelRatio ||
                                 cxt.oBackingStorePixelRatio ||
                                 cxt.backingStorePixelRatio || 1;

    var ratio = devicePixelRatio / backingStorePixelRatio;

    if (devicePixelRatio !== backingStorePixelRatio) {
        var oldWidth = canvas.width;
        var oldHeight = canvas.height;

        canvas.width = oldWidth * ratio;
        canvas.height = oldHeight * ratio;

        canvas.style.width = oldWidth + 'px';
        canvas.style.height = oldHeight + 'px';

        cxt.scale(3, 3);
    }
    return cxt;
};

//计算路径
function calcPath(StartPoint,StopPoint,IsCar){
    var _path = data.path;
    for(var i in totalData){
        if(totalData[i].floor == StartPoint.floor){
            _path = totalData[i].path;
        }
    }
    
    
	var BeginPoint = getPointsByPath(_path,StartPoint)[0];
	var EndPoint = getPointsByPath(_path,StopPoint)[0];
	var TotalLength = 0;
	var success = true;
	var g = new Graph();
	for(var i=0;i<_path.points.length;i++){
		var arr = [],obj={};
		var _p = _path.points[i];
		for(var j=0;j<_path.lines.length;j++){
            if(IsCar && _path.lines[j].c == 1){
                continue;
            }
            if(_path.points[i].id == _path.lines[j].a){
                arr.push(_path.lines[j].b);
            }
            if(_path.points[i].id == _path.lines[j].b){
                arr.push(_path.lines[j].a);
            }
		}
		for(var k=0;k<arr.length;k++){
			var P = getPoint(arr[k],_path.points);
			obj["P"+arr[k]] = getLength(_p,P);
		}
		g.addVertex("P"+_p.id,obj);
	}

	var obj = {};
	obj["P"+BeginPoint.A.id] = BeginPoint.AD;
	obj["P"+BeginPoint.B.id] = BeginPoint.BD;
	g.addVertex("Begin",obj);
	var obj = {};
	obj["P"+EndPoint.A.id] = EndPoint.AD;
	obj["P"+EndPoint.B.id] = EndPoint.BD;
	g.addVertex("End",obj);


	g.addVertex("P"+EndPoint.A.id,{End:EndPoint.AD});
	g.addVertex("P"+EndPoint.B.id,{End:EndPoint.BD});

	var pathList = (g.shortestPath('Begin', 'End').reverse());
	if(!pathList || pathList.length == 0){
		success = false;
	}
	if(pathList.length == 2 && (BeginPoint.A.id == EndPoint.A.id && BeginPoint.B.id == EndPoint.B.id)){
		pathList.shift();
	}

    var totalPath = new Array();
    totalPath.push(StartPoint);//起点
    totalPath.push(BeginPoint.D);//起点-起点距路径的最近点


	TotalLength += getLength(StartPoint,BeginPoint.D);
	var lastPoint = {x:StartPoint.x,y:StartPoint.y};

    var minPoint = {x:StartPoint.x,y:StartPoint.y};
    var maxPoint = {x:StartPoint.x,y:StartPoint.y};
	for(var i=0;i<pathList.length-1;i++){
		totalPath.push(getPoint(pathList[i].substr(1),_path.points));
	}
    totalPath.push(EndPoint.D);//最后节点-终点距路径的最近点
    totalPath.push(StopPoint);//终点距路径的最近点-终点

    for(var i=1;i<totalPath.length;i++){
        var a = totalPath[i];

		TotalLength += getLength(lastPoint,a);
		lastPoint = a;

        minPoint.x = Math.min(minPoint.x,a.x);
        minPoint.y = Math.min(minPoint.y,a.y);
        maxPoint.x = Math.max(maxPoint.x,a.x);
        maxPoint.y = Math.max(maxPoint.y,a.y);
    }


    return {
		success:success,
        StartPoint:StartPoint,
        StopPoint:StopPoint,
        BeginPoint:BeginPoint,
        EndPoint:EndPoint,
        minPoint:minPoint,
        maxPoint:maxPoint,
        path:totalPath,
        length:TotalLength
    }
}


//绘制路径
function drawPath(result){

	var ctx = canvas.getContext("2d");
	ctx.beginPath();

	drawMoveTo(ctx,result.StartPoint);
    for(var i=1;i<result.path.length;i++){
        var a = result.path[i];
        drawLineTo(ctx,a);
		ctx.strokeStyle = "#1a98e3";
		ctx.lineWidth = 4 * _Draw_Canvas_LineWidth;
		ctx.stroke();
    }


	$('.targetAddress').text(result.StartPoint.floor + '层' + (result.StopPoint.name || result.StopPoint.pointName || ""));
	$('.calcPathLength').text(parseInt(result.length/1000));

    if(result.targetPoint && (result.align == 'start' || result.align == 'middle')){
        $('.targetAddress').text($('.targetAddress').text() + '[去往'+result.targetPoint.floor+'层]');
    }
    
	preImage("img/row.png",function(){
		var row = this;
		var oldPoint = result.BeginPoint.D;
        var oldJiaoDu;
		for(var i=0;i<result.path.length-1;i++){
			var a = result.path[i];
			var jiaodu = angle(oldPoint,a);

            if(oldJiaoDu && Math.abs(jiaodu - oldJiaoDu) > 15){
                ctx.save();
                ctx.translate(js_x(oldPoint.x),js_y(oldPoint.y));
                ctx.rotate(jiaodu*Math.PI/180);
                ctx.translate(-js_x(oldPoint.x),-js_y(oldPoint.y));
                ctx.drawImage(row,js_x(oldPoint.x)-16,js_y(oldPoint.y)-16,32,32);
                ctx.restore();
            }
			
			oldPoint = a;
            oldJiaoDu = jiaodu;
		}
	});

	preImage("img/start_point.png",function(){
		var h = this.height / 2;
		var w = this.width /2;
		ctx.drawImage(this,js_x(result.StartPoint.x)-w/2,js_y(result.StartPoint.y)-h/2,w,h);
	});
    if(showType != '6'){
        preImage("img/stop_point.png",function(){
            var h = this.height / 2;
            var w = this.width / 2;
            ctx.drawImage(this,js_x(result.StopPoint.x)-w/2,js_y(result.StopPoint.y)-h/2,w,h);
        });
    }
	

    var start = true,end = true;
    if(result.align == 'start' || result.align == 'middle'){
        end = false;
    }
    if(result.align == 'end' || result.align == 'middle'){
        start = false;
    }
    if(start){
        preImage("img/start.png",function(){
            var h = this.height / 2;
            var w = this.width / 2;
            ctx.drawImage(this,js_x(result.StartPoint.x)-w/2,js_y(result.StartPoint.y)-h-8,w,h);
        });
    }else{
        preImage("img/come.png",function(){
            var h = this.height / 2;
            var w = this.width / 2;
            ctx.drawImage(this,js_x(result.StartPoint.x)-w/2,js_y(result.StartPoint.y)-h-8,w,h);
        });
    }
    if(end){
        preImage("img/end.png",function(){
            var h = this.height / 2;
            var w = this.width / 2;
            ctx.drawImage(this,js_x(result.StopPoint.x)-w/2,js_y(result.StopPoint.y)-h-8,w,h);
        });
    }else{
        preImage("img/come.png",function(){
            var h = this.height / 2;
            var w = this.width / 2;
            ctx.drawImage(this,js_x(result.StopPoint.x)-w/2,js_y(result.StopPoint.y)-h-8,w,h);
        });
    }
}
