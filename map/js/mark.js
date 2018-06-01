var currentPoint = {};
var carPoint = {};
var parkID = request('parkID');
$(document).ready(function(){
    
    try{
        currentPoint = eval('('+decodeURIComponent(request('currentPoint')) +')');
        carPoint = request('carPoint') ? eval('('+decodeURIComponent(request('carPoint'))+')') : false;
        //currentPoint = {x:78177,y:179205,floor:'B1',pointName:'A区0003'};
        //carPoint = {x:42583,y:241110,floor:'B1',pointName:'A区0055'};
    }catch(e){
        $('.msg').text('参数异常');
    }
    taps($('#btn_view'),function(){
        location = 'm.html?currentPoint='+encodeURIComponent(JSON.stringify(currentPoint))+
                '&carPoint='+encodeURIComponent(JSON.stringify(carPoint))+'&showType=0&parkID='+parkID;
    },'tap');
    
    setcarpoint('',currentPoint.pointID,function(){
        $('.msg').text('已标记您的车辆位置为：' + currentPoint.pointName);
    });
});