/**
 * Created by EGOVA_C on 2017/7/12.
 */

var typeAssign = "@property (assign, nonatomic) ";
var typeCopy   = "@property (copy, nonatomic) ";
var typeStrong = "@property (strong, nonatomic) ";
var objCFiles = [];

$(document).ready(function () {

    $("#tr_transformerBtn").click(function () {

        var jsonStr = $("#tr_jsonTextarea").val();
        getObjC(jsonStr);
        $("#tr_list").empty();
        if (objCFiles.length > 0){
            for (var idx in objCFiles){
                var htmlCode = "<div class=\"mui-panel\">"
                    + objCFiles[idx]
                    + "</div>";
                $("#tr_list").append(htmlCode);
            }
        }
    });
})

function getObjC(json) {

    objCFiles = [];
    // if (!isJson(json)) {
    //     alert("json格式有误！");
    //     return;
    // }
    var obj = JSON.parse(json);
    getSingleObjC(obj, "RootModel");
}
// 根据一个对象生成单个类
function getSingleObjC(obj, className) {

    var objC = "@interface "+ ucfirst(className) + " : NSObject\n"
    for(var key in obj){
        objC = objC + getProp(key, obj[key]);
    }
    objC += "\n \n@end"
    objCFiles.push(objC);

    for(var key in obj){
        if (isArray(obj[key])){
            getSingleObjC(obj[key][0], key);
        }else if (isDictionary(obj[key])){
            getSingleObjC(obj[key], key);
        }
    }
}
// 根据键值对 生成单条代码
function getProp(k, v) {

    if (isString(v)){
        return "\n" + typeCopy + "NSString *" + k + ";";

    }else if (isBoolean(v)){
        return "\n" + typeAssign + "BOOL " + k + ";";

    }else if (isInt(v)){
        return "\n" + typeAssign + "NSInteger " + k + ";";

    }else if (isDouble(v)){
        return "\n" + typeAssign + "Double " + k + ";";

    }else if (isArray(v)){
        return "\n" + typeCopy + "NSArray *" + k + ";";

    }else if (isDictionary(v)){
        return "\n" + typeStrong + ucfirst(k) + " *" + k + ";";

    }
    return "\n// 未知类型 null \n" + typeStrong + "id *" + k + ";";;
}
// 工具方法
function isInt(v){

    if (typeof(v) == "number"){
        var reg = /^(-|\+)?\d+$/ ;
        return reg.test(v.toString());
    }
    return false;
}

function isString(v){
    return typeof(v) == "string";
}

function isBoolean(v){
    return typeof(v) == "boolean";
}

function isDouble(v){

    if (typeof(v) == "number"){
        var reg = /^(-|\+)?\d+\.\d*$/;
        return reg.test(v.toString());
    }
    return false;
}

function isArray(v) {
    return Object.prototype.toString.call(v) === '[object Array]';
}

function isDictionary(v) {
    return !isArray(v) && typeof(v) == "object" && v != null;
}

function ucfirst(str) {

    str = str.replace(/\b\w+\b/g, function(word){
        return word.substring(0,1).toUpperCase()+word.substring(1);
    });
    return str;
}

//判断obj是否为json对象
function isJson(obj){
    var isjson = typeof(obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
    return isjson;
}