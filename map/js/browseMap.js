/**
 * Created by EGOVA_C on 2017/10/30.
 */
var data = [];
var floorNames = null;
$(document).ready(function () {
    $("#srcInput").val('data/_testmap/map.json');
    $("#file_input").change(readJsonFiles);

    var files = document.getElementById('file_input').files;
    if (files.length > 0){
        readJsonFiles();
    }
});

function browseMap() {
    var src = $("#srcInput").val();
    location = 'browseMapM.html?map_url='+src;
}

function browseCoordinate() {
    var src = $("#srcInput").val();
    location = 'qrmap.html?map_url='+src;
}

function browseAndCheckOutMap() {
    var scr = $("#srcInput").val();
    location = 'browseMapM.html?map_url='+scr+'&check_out=ture';
}

function browseMapWithData() {
    if(data.length > 0){
        location = 'browseMapM.html?map_data=data';
    }else {
        alert("无数据，请选择json文件");
    }
}

function browseDebugMapWithData() {
    if(data.length > 0){
        location = 'browseMapM.html?map_data=data&debug=true';
    }else {
        alert("无数据，请选择json文件");
    }
}

function browseJSON() {
    if(data.length > 0){
        location = 'mapjson.html';
    }else {
        alert("无数据，请选择json文件");
    }
}

function generateMap() {

    if (data.length > 0){
        parseMapData();
        localStorage.clear();
        _SET_DATA('data',data);
        _SET_DATA('md5', 2);
        alert("生成地图成功，可以查看");
    }else {
        alert("无数据，请选择json文件");
    }
}

function readJsonFiles() {

    var files = document.getElementById('file_input').files;
    if (files.length <= 0){
        alert('没有选择文件！');
        return;
    }
    data = [];
    floorNames = [];
    var sortedFiles = sortFiles(files);
    if (sortedFiles && sortedFiles.length > 0) {
        loadFiles(sortedFiles, 0);
    }
}

function loadFiles(files, idx) {
    
    if (idx >= files.length)
        return;
    var file = files[idx];
    var fileName = getFileName(file.name);
    floorNames.push(fileName.split('.')[0]);
    var fileReader = new FileReader();
    fileReader.readAsText(file);
    fileReader.onload = function (e) {
        var content = eval('('+this.result+')');
        data.push(content);
        loadFiles(files, ++idx);
    }
}

function getFileName(fileName) {
    var fnArr = fileName.split('-');
    if (fnArr.length < 2) {
        return null;
    }
    var name = fnArr[1].split('.')[0];
    if (name) {
        return name;
    }
    return null;
}

function getFileIndex(fileName) {
    var idx = fileName.split('-')[0];
    if (idx && idx.length > 0) {
        return parseInt(idx);
    }
    return null;
}

function sortFiles(files) {
    
    var sortedFiles = [];
    
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file.type != "application/json"){
            alert(file.name + " 不是JSON文件，将不做处理");
        }
        else {
            var fileName = getFileName(file.name);
            if (fileName == null || fileName.length == 0) {
                alert(file.name + " 名称命名不符合格式(序号-楼层名.json)");
            }
            else {
                sortedFiles.push(file);
            }
        }
    }
    if (sortedFiles.length == 0) {
        return null;
    }
    var i = 0, j = 0, flag = file;
    for (i = 0; i < sortedFiles.length; i++) {
        for (j = 0; j < sortedFiles.length - i - 1; j++) {
            var idx = getFileIndex(files[j].name);
            var nextIdx = getFileIndex(files[j+1].name);
            if (idx && nextIdx) {
                if (idx > nextIdx) {
                    var temp = files[j];
                    files[j] = files[j+1];
                    files[j+1] = temp;
                }
            }
        }
    }
    return sortedFiles;
}

function parseMapData() {
    
    // var isActive = document.getElementById('switch').classList.contains('mui-active');
    // var floorName = isActive?"F":"B";
    // var floorNames = ['4F', '3F', '2F', '1F', 'B1'];
    for(var i = 0; i < data.length; i++){
        var obj = data[i];
        // var idx = isActive?data.length-i+1:i+1;
        // var floorName = isActive?(idx+"F"):("B3");
        var floorName = floorNames[i];
        obj.floor = floorName;
        obj.floorName = floorName;
        obj.levels = [0.0035,0.006,0.012,0.025];
        obj.levels_pc = [0.0035,0.006,0.009,0.02,0.04];
        obj.nav = [{"class":"carexit","text":"车辆出口","type":"car_exit,car_entrance"},
            {"class":"toilet","text":"厕所","type":"wc,wc_man,wc_woman"}];
    }
    var channels = parseFloorInfo(data);
    for (var i = 0; i < data.length; i++){
        var obj = data[i];
        obj.channel = channels[i];
    }
}
// 添加楼层信息
function parseFloorInfo(totalData) {
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
                    if(point.floor != points[k].floor && points[k].text != 'escalator_down' && points[k].text != 'car_exit' && points[k].text != 'car_entrance'){
                        channels[i].push({id:point.id,id2:points[k].id,floor:points[k].floor});
                    }
                }
            }
        }
    }
    return channels;
}