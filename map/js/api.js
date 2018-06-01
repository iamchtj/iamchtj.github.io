var api_url ='http://api.tongtongtingche.com.cn/MobileServer/home/parkingspacepoint/';
//var api_url ='http://api.tongtongtingche.com.cn/MobileServer/home/parkingspacepoint/';
function api_ajax(options){
    $.ajax({
        url:api_url + options.action,
        type:'GET',
        data:options.data,
        success:function(res){
            console.log(res);
            options.success && options.success(res);
        }
    });
}

function login(username,password,success,error){
    api_ajax({
        action : '../../public/login',
        data : 'username=' + username + '&pwd=' + password + '&loginType=1',
        cache : false,
        success:function(res){
            success(res);
        },
        error:function(res){
            error(res);
        }
    })
}

/*获取二维码列表*/
function pointlist(parkID,success){
    api_ajax({
        action : 'pointlist.htm',
        data : 'parkID='+parkID,
        cache : false,
        success:function(res){
            success(res.data.pointList);
        }
    });
}
/*获取用户当前位置和车辆位置*/
function carlocation(userID,success){
    api_ajax({
        action : 'carlocation.htm',
        data : '',//userID='+userID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
/*设置车辆到当前位置*/
function setcarpoint(userID,pointID,success){
    api_ajax({
        action : 'setcarpoint.htm',
        data : 'userID='+userID+'&pointID='+pointID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
/*增加二维码*/
function addQRPoint(point,success){
    api_ajax({
        action : '144/add.htm',
        data : 'parkID='+point.parkID+'&floor='+point.floor+'&x='+point.x+'&y='+point.y+'&pointName='+point.pointName,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
/*删除二维码*/
function delQRPoint(pointID,success){
    api_ajax({
        action : 'removepoint.htm',
        data : 'pointID='+pointID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
/*查询二维码*/
function scancode(url,setLocationFlag,success){
    api_ajax({
        action : 'scancode',
        data : 'url='+ encodeURIComponent(url) + '&setLocationFlag='+setLocationFlag,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
//批量下载二维码图片
function downQRList(parkID){
    window.open(api_url +'downloadqrcode?parkID='+parkID+'');
}

//添加特征点
function addfeature(feature,success){
    api_ajax({
        action : 'addfeature',
        data : 'parkID='+feature.parkID+
                '&featurePoint='+feature.featurePoint+
                '&name='+feature.name+
                '&floor='+feature.floor+
                '&type='+feature.type
        ,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}
//修改特征点
function updatefeaturename(feature,success){
    api_ajax({
        action : 'updatefeaturename',
        data : 'featureID='+feature.featureID+
                '&name='+feature.name
        ,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}


//添加特征点
function removefeature(featureID,success){
    api_ajax({
        action : 'removefeature',
        data : 'featureID='+featureID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}

//添加特征点
function searchfeature(search,success){
    var para = '1=1';
    for(key in search){
        para += '&' + key + '=' + search[key];
    }
    api_ajax({
        action : 'searchfeature',
        data : para,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}

//保存地图点名称
function savemappoint(point,success){
    api_ajax({
        action : 'savemappoint',
        data : 'parkID='+point.parkID+
        '&floor='+point.floor+
        '&id='+point.id+
        '&name='+point.name,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}

//查询地图点名称
function searchmappoint(parkID,success){
    api_ajax({
        action : 'searchmappoint',
        data : 'parkID='+parkID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}

//查询地图
function package(parkID,success){
    api_ajax({
        action : 'package',
        data : 'parkID='+parkID,
        cache : false,
        success:function(res){
            success(res);
        }
    });
}

