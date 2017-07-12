/**
 * Created by EGOVA_C on 2017/7/12.
 */

$(document).ready(function () {

    $("#tr_transformerBtn").click(function () {

        var jsonStr = $("#tr_jsonTextarea").val();
        if (jsonStr.length > 0){
            $("#tr_objCTextarea").text(getObjC(jsonStr));
            $("#tr_objCTextarea").show();
        }else {
            $("#tr_objCTextarea").hide();
        }
    });

    function getObjC(json) {
        
        return json;
    }
})