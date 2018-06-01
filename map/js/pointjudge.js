//计算向量叉乘  
var crossMul=function(v1,v2){  
     return   v1.x*v2.y-v1.y*v2.x;  
 }  
//判断两条线段是否相交  
var checkCross=function(p1,p2,p3,p4){  
     //alert(p3.x);
     var v1={x:p1.x-p3.x,y:p1.y-p3.y},  
     v2={x:p2.x-p3.x,y:p2.y-p3.y},  
     v3={x:p4.x-p3.x,y:p4.y-p3.y},  
     v=crossMul(v1,v3)*crossMul(v2,v3)  
     v1={x:p3.x-p1.x,y:p3.y-p1.y}  
     v2={x:p4.x-p1.x,y:p4.y-p1.y}  
     v3={x:p2.x-p1.x,y:p2.y-p1.y}  
     return (v<=0&&crossMul(v1,v3)*crossMul(v2,v3)<=0)?true:false 
 }  
//判断点是否在多边形内  
var checkPP=function(point,polygon){ 
     //console.log(polygon);
     if(polygon==undefined) return;
     var p1,p2,p3,p4  
     p1=point  
     p2={x:-10000000,y:-10000000}  
     var count=0  
     //对每条边都和射线作对比  
     for(var i=0;i<polygon.length-1;i++){  
         p3=polygon[i]  
        p4=polygon[i+1]  
         if(checkCross(p1,p2,p3,p4)==true){  
             count++  
         }  
     }  
     p3=polygon[polygon.length-1]  
     p4=polygon[0]  
     if(checkCross(p1,p2,p3,p4)==true){  
        count++  
     }  
     return (count%2==0)?false:true 
} 

//查找最近导航点
function getPointsByPath(paths,point){
    var _list = [];
    var _listPath = [];
    var path = paths.lines;
    
    for(var i=0;i<path.length;i++){
        var A = getPoint(path[i].a,paths.points);
        var B = getPoint(path[i].b,paths.points);
        var C = point;
        _listPath[i] = {A:A,B:B,length:Math.min(getLength(A,C),getLength(B,C))};
    }
    _listPath.sort(function(a,b){
        return a.length - b.length;
    });
    for(var i=0;i<_listPath.length&&i<50;i++){
        var A = _listPath[i].A;
        var B = _listPath[i].B;
        var C = point;
        var D = {};
//        var AB = getLength(A,B);//三角边长
//        var BC = getLength(B,C);
//        var AC = getLength(A,C);
//        var P = (AB + BC + AC) / 2;//半周长
//        var S = Math.sqrt(P*(P-AB)*(P-BC)*(P-AC));//三角面积
//        var CD = S*S/AB;//垂直线边长
//        var AD = 0;
        var se =  (A.x-B.x)*(A.x-B.x)+(A.y-B.y)*(A.y-B.y);//线段两点距离平方  
        var p = ((C.x-A.x)*(B.x-A.x)+(C.y-A.y)*(B.y-A.y)); //向量点乘=|a|*|b|*cosA  
        var r = p/se; //r即点到线段的投影长度与线段长度比  
        D.x=A.x+r*(B.x-A.x);   
        D.y=A.y+r*(B.y-A.y);   
        //var des =(C.x-D.x)*(C.x-D.x)+(C.y-D.y)*(C.y-D.y); 
        _list[i] = {A:A,B:B};
        _list[i].D = D;
        _list[i].length = getLength(C,D);
        if(!pointInLine({a:A,b:B},D)){
            _list[i].length = Math.min(getLength(A,C),getLength(B,C));
            _list[i].D = getLength(A,C) < getLength(B,C) ? A : B;
        }
        _list[i].AD = getLength(A,D);
        _list[i].BD = getLength(B,D);
    }
    _list.sort(function(a,b){
        return a.length - b.length;
    });
    return _list;
}
//通过ID获取数组里的点
function getPoint(id,points){
    for(var i=0;i<points.length;i++){
        if(points[i].id == id){
            return points[i];
        }
    }
    console.log(id)
}
//计算两点距离
function getLength(a,b){
    var xdiff = b.x - a.x;
    var ydiff = b.y - a.y;
    return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
}
//确定点是否在线段之外
function pointOutLine(line,point){
    
    if(line.a.x >= line.b.x && line.a.y >= line.b.y){
        if((point.x >= line.a.x && point.y > line.a.y) || (point.x > line.a.x && point.y >= line.a.y)){
            return true;
        }
        if((point.x <= line.b.x && point.y < line.b.y) || (point.x < line.b.x && point.y <= line.b.y)){
            return true;
        }
    }
    if(line.b.x >= line.a.x && line.b.y >= line.a.y){
        if((point.x >= line.b.x && point.y > line.b.y) || (point.x > line.b.x && point.y >= line.b.y)){
            return true;
        }
        if((point.x <= line.a.x && point.y < line.a.y) || (point.x < line.a.x && point.y <= line.a.y)){
            return true;
        }
    }
    if(line.a.x <= line.b.x && line.a.y >= line.b.y){
        if((point.x <= line.a.x && point.y > line.a.y) || (point.x < line.a.x && point.y >= line.a.y)){
            return true;
        }
        if((point.x >= line.b.x && point.y < line.b.y) || (point.x > line.b.x && point.y <= line.b.y)){
            return true;
        }
    }
    if(line.b.x <= line.a.x && line.b.y >= line.a.y){
        if((point.x <= line.b.x && point.y > line.b.y) || (point.x < line.b.x && point.y >= line.b.y)){
            return true;
        }
        if((point.x >= line.a.x && point.y < line.a.y) || (point.x > line.a.x && point.y <= line.a.y)){
            return true;
        }
    }
    return false;
}

//根据2点求角度
function angle(start,end){
    if(start.x == end.x){
        if(start.y < end.y){
            return 0;
        }else{
            return 180;
        }
    }
    if(start.y == end.y){
        if(start.x > end.x){
            return 270;
        }else{
            return 90;
        }
    }
    
    
    var diff_x = end.x - start.x,
        diff_y = end.y - start.y;
    
    //返回角度,不是弧度
    var r = 360*Math.atan(diff_x/diff_y)/(2*Math.PI);
    if(end.y < start.y){
        r += 180;
    }
    if(start.x > end.x && start.y < end.y){
        r += 360;
    }
    return r;
}

//判断点是否在线段内
function pointInLine(line,point){
    if(getLength(line.a,point)+getLength(line.b,point) - getLength(line.a,line.b) < 1){
        return true;
    }
    return false;
}

//获取矩形中心点
function PolygonCenter(polygon){
    var x = Math.min(polygon[0].x,polygon[2].x) + Math.abs(polygon[0].x-polygon[2].x)/2;
    var y = Math.min(polygon[0].y,polygon[2].y) + Math.abs(polygon[0].y-polygon[2].y)/2;
    return {
        x:x,
        y:y
    }
}

