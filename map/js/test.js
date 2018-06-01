//APP专用
localStorage.clear();
getData('data/zhongguancunruanjianyuan/9.json','1',function(res){
    initPage({},{currentPoint:{floor:'B2',x:-425090,y:-678926},carPoint:{floor:'B1',x:-655992,y:-709509},showType:1},res,[],[]);
});

//在线专用
localStorage.clear();
getData('data/xinzhengjichang/map.json','1',function(res){
    $('loadding').hide();
    totalData = res;
    if(showType=='1' || showType == '6'){
        autoCalc = showCalc = true;
    }else{
        autoCalc = false;
    }
    initControl();
    linkFloor(window._defaultFloor || totalData[0].floor);
});

//跨楼层信息生成工具
var group = new Map();
var channels = new Array();
for(var i=0;i<totalData.length;i++){
    channels[i] = new Array();
    for(var j=0;j<totalData[i].background.points.length;j++){
        var point = totalData[i].background.points[j];
        if(point.group){
            point.floor = totalData[i].floor;
            if(!group.has(point.group)){
                group.set(point.group,[]);
            }
            var points = group.get(point.group);
            points.push(point);
        }
    }
}
for(var i=0;i<totalData.length;i++){
    channels[i] = new Array();
    for(var j=0;j<totalData[i].background.points.length;j++){
        var point = totalData[i].background.points[j];
        if(point.group){
            var points = group.get(point.group);
            for(var k=0;k<points.length;k++){
                if(point.floor != points[k].floor){
                    channels[i].push({id:point.id,id2:points[k].id,floor:points[k].floor});
                }
            }
        }
    }
}
'"channel":' + JSON.stringify(channels[0])
//"channel":[]

