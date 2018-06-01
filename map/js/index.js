var currentPoint = {};
var carPoint = {};

$(document).ready(function(){
    
    taps($('#btn_save'),function(){
        if(currentPoint.floor != 'B2'){
            alert('不能记录车辆到当前楼层！');
            return;
        }
        if(carPoint && carPoint.pointID && carPoint.pointID == currentPoint.pointID){
            alert('车辆已标记为当前位置！');
            return;
        }
        if(confirm('确定要记录车辆到'+currentPoint.pointName+'?')){
            setcarpoint('',currentPoint.pointID,function(){
                location.reload();
            });
        }
    },'tap');
    taps($('#btn_look'),function(){
        if(carPoint && carPoint.pointID != currentPoint.pointID){
            location = 'm.html?currentPoint='+encodeURIComponent(JSON.stringify(currentPoint))+
                '&carPoint='+encodeURIComponent(JSON.stringify(carPoint))+'&showType=1';
        }
    },'tap');
    taps($('#btn_view'),function(){
        location = 'm.html?currentPoint='+encodeURIComponent(JSON.stringify(currentPoint))+
                '&carPoint='+encodeURIComponent(JSON.stringify(carPoint))+'&showType=0';
    },'tap');
    
    carlocation('',function(res){
        if(!res.success){
            $('#currentAddress').text(res.message);
            return;
        }
        var data = res.data;
        
        currentPoint  = data.currentPoint;
        carPoint = data.carPoint;
        
        if(currentPoint){
            if(currentPoint.floor == 'B2' && (carPoint && carPoint.pointID && carPoint.pointID != currentPoint.pointID)){
                $('#btn_save').removeClass('disabled');
            }
            $('#currentAddress').text(currentPoint.floor + '-'+currentPoint.pointName);
        }
        if(carPoint){
            if(carPoint.pointID != currentPoint.pointID){
                $('#btn_look').removeClass('disabled');
            }
            
            $('#carAddress').text(carPoint.floor+'-'+carPoint.pointName);
        }
        
    });
});