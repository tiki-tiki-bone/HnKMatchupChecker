//描画コンテキストの取得
var animid;

const char = ["KE", "RA", "TO", "JA", "SH", "RE", "JU", "TH", "HE", "MA"];
const boost = [
    0, 28.799999237060547, 25.920000076293945, 23.328001022338867, 20.995201110839844,
    18.895681381225586, 17.006113052368164, 15.305501937866211, 13.774951934814453,
    12.397457122802734, 11.157711982727051, 10.041940689086914, 9.0377464294433594,
    8.13397216796875, 7.3205747604370117, 6.5885171890258789, 5.9296655654907227,
    5.3366990089416504, 4.8030290603637695, 4.3227262496948242, 3.890453577041626,
    3.5014083385467529, 3.1512675285339355, 2.8361408710479736, 2.5525269508361816,
    2.2972743511199951, 2.067547082901001, 1.8607923984527588, 1.674713134765625,
    1.5072418451309204, 1.3565176725387573, 1.2208659648895264, 1.0987794399261475,
    0.9889014959335327, 0.8900113701820374, 0.8010102510452271, 0.7209092378616333,
    0.64881831407547, 0.5839365124702454, 0.5255428552627564, 0.4729885756969452,
    0.4256897270679474, 0.3831207454204559, 0.3448086678981781, 0.3103277981281281,
    0.279295027256012, 0.2513655424118042, 0.2262289822101593, 0.2036060839891434,
];
var state = {
    0: "立ち",
    1: "しゃがみガード",
    2: "しゃがみ",
    4: "立ちガード",
    7: "バックジャンプ",
    8: "垂直ジャンプ",
    9: "前ジャンプ",
    "5a": "遠A",
    "5b": "遠B",
    "5c": "遠C",
    "5d": "遠D",
    "2a": "2A",
    "2b": "2B",
    "2c": "2C",
    "2d": "2D",
    "6a": "6A",
    "6b": "6B",
    "6d": "6D",
    ab: "ヘヴィー",
    ac: "グレ",
    bd: "掴み投げ",
    cd: "バニ",
};
var p1char = 0;
var p2char = 0;
var stage_img;
var p1_img = [];
var p2_img = [];
var boost_img = [];
var imgCount = 0;

var p1x = 480.0;
var p1y = 984.0;
var p2x = 800.0;
var p2y = 984.0;

var p1facing = 1;
var p2facing = -1;

//コマ送り
var isNext = false;
var isPaused = true;
//ステート番号
var p1stateno = 0;
var p2stateno = 0;
//ステート全体時間
var p1time = 0;
var p2time = 0;
//ステート内経過時間
var p1timeno = 0;
var p2timeno = 0;
//スプライトの全体表示時間
var p1elem;
var p2elem;
//画像番号
var p1image;
var p2image;
//現在のスプライトの順番
var p1elemno = 0;
var p2elemno = 0;
//現在のスプライトの表示時間
var p1elemtime = 0;
var p2elemtime = 0;
//判定
var p1hitbox = [];
var p2hitbox = [];
//衝突後
var collision = false;
//画像オフセット
var stageoffset = [];
stageoffset["x"] = -320;
stageoffset["y"] = -544;
var p1offset = [];
var p2offset = [];
//技固有移動値
var p1movement = [];
var p2movement = [];
//速度
var p1v = [];
p1v["x"] = 0;
p1v["y"] = 0;
var p2v = [];
p2v["x"] = 0;
p2v["y"] = 0;
//存在判定
var p1push = [];
p1push["stand"] = [];
p1push["crouch"] = [];
p1push["air"] = [];
p1push["current"] = [];
var p2push = [];
p2push["stand"] = [];
p2push["crouch"] = [];
p2push["air"] = [];
p2push["current"] = [];

//変更後データバッファ
var p1res;
var p2res;
//ブースト経過時間
var p1boostno = -1;
var p2boostno = -1;
var p1boost_x = 0;
var p1boost_y = 0;
var p2boost_x = 0;
var p2boost_y = 0;

var context;
var canvas;
window.onload = function () {
    canvas = document.getElementById("checker");
    canvas.width = 640;
    canvas.height = 480;

    if (canvas.getContext) {
        context = canvas.getContext("2d");
        stage_img = new Image();
        setloadfunc(stage_img);
    }

    loadImage_boost();
    p1getdata_fromjson();
};

function loop(timestamp) {
    setTimeout(function () {
        setup_pos();
        posaddvel();
        cameramove();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(stage_img, stageoffset["x"], stageoffset["y"]);
        context.drawImage(
            p1_img[p1image[p1elemno]],
            p1x + stageoffset["x"] + parseInt(p1offset["x"][p1elemno]),
            p1y +
                stageoffset["y"] -
                p1_img[p1image[p1elemno]].height +
                parseInt(p1offset["y"][p1elemno]),
        );
        if (p1boostno >= 0 && p1boostno <= 31) {
            context.drawImage(
                boost_img[p1boostno],
                p1boost_x + stageoffset["x"] - 450 * p1facing,
                p1boost_y + stageoffset["y"] - 400,
            );
        }
        context.transform(-1, 0, 0, 1, p2_img[p2image[p2elemno]].width, 0);
        context.drawImage(
            p2_img[p2image[p2elemno]],
            -(p2x + stageoffset["x"] - parseInt(p2offset["x"][p2elemno])) +
                p2_img[p2image[p2elemno]].width,
            p2y +
                stageoffset["y"] -
                p2_img[p2image[p2elemno]].height +
                parseInt(p2offset["y"][p2elemno]),
        );
        context.transform(-1, 0, 0, 1, p2_img[p2image[p2elemno]].width, 0);
        if (p2boostno >= 0 && p2boostno <= 31) {
            context.transform(-1, 0, 0, 1, boost_img[p2boostno].width, 0);
            context.drawImage(
                boost_img[p2boostno],
                -(p2boost_x + stageoffset["x"]) - 210 * p2facing,
                p2boost_y + stageoffset["y"] - 400,
            );
            context.transform(-1, 0, 0, 1, boost_img[p2boostno].width, 0);
        }

        context.beginPath();
        for (var i = 0; i < p1hitbox[p1elemno].length; i++) {
            //喰らい判定
            if (p1hitbox[p1elemno][i][4] == "B") {
                context.fillStyle = "rgba(" + [0, 0, 255, 0.4] + ")";
                //攻撃判定
            } else if (p1hitbox[p1elemno][i][4] == "R") {
                context.fillStyle = "rgba(" + [255, 0, 0, 0.4] + ")";
                //その他
            } else if (p1hitbox[p1elemno][i][4] == "G") {
                context.fillStyle = "rgba(" + [0, 255, 0, 0.4] + ")";
            }
            context.fillRect(
                p1x + stageoffset["x"] + parseInt(p1hitbox[p1elemno][i][0]),
                p1y + stageoffset["y"] + parseInt(p1hitbox[p1elemno][i][1]),
                parseInt(p1hitbox[p1elemno][i][2]),
                parseInt(p1hitbox[p1elemno][i][3]),
            );
        }
        for (var i = 0; i < p2hitbox[p2elemno].length; i++) {
            //喰らい判定
            if (p2hitbox[p2elemno][i][4] == "B") {
                context.fillStyle = "rgba(" + [0, 0, 255, 0.4] + ")";
                //攻撃判定
            } else if (p2hitbox[p2elemno][i][4] == "R") {
                context.fillStyle = "rgba(" + [255, 0, 0, 0.4] + ")";
                //その他
            } else if (p2hitbox[p2elemno][i][4] == "G") {
                context.fillStyle = "rgba(" + [0, 255, 0, 0.4] + ")";
            }
            context.fillRect(
                p2x + stageoffset["x"] - parseInt(p2hitbox[p2elemno][i][0]),
                p2y + stageoffset["y"] + parseInt(p2hitbox[p2elemno][i][1]),
                -parseInt(p2hitbox[p2elemno][i][2]),
                parseInt(p2hitbox[p2elemno][i][3]),
            );
        }

        if (collision_check() != "") {
            collision = true;
            reset();
        }
        p1timeno++;
        p2timeno++;
        p1elemtime++;
        p2elemtime++;
        if (p1elemtime >= p1elem[p1elemno] && p1elem[p1elemno] != -1) {
            p1elemno++;
            p1elemtime = 0;
        }
        if (p1elemno >= p1elem.length) {
            p1elemno = 0;
            if (
                p1stateno != "2a" &&
                p1stateno != "2b" &&
                p1stateno != "2c" &&
                p1stateno != "2d" &&
                p1time != -1
            ) {
                p1stateno = 0;
                jQuery("#1P_M").val("0");
                p1getdata_fromjson();
                stop();
            } else if (p1time != -1) {
                p1stateno = 1;
                jQuery("#1P_M").val("1");
                p1getdata_fromjson();
                stop();
            }
        }
        if (p2elemtime >= p2elem[p2elemno] && p2elem[p2elemno] != -1) {
            p2elemno++;
            p2elemtime = 0;
        }
        if (p2elemno >= p2elem.length) {
            p2elemno = 0;
            p2elemtime = 0;
            if (
                p2stateno != "2a" &&
                p2stateno != "2b" &&
                p2stateno != "2c" &&
                p2stateno != "2d" &&
                p2time != -1
            ) {
                p2stateno = 0;
                jQuery("#2P_M").val("0");
                p2getdata_fromjson();
                stop();
            } else if (p2time != -1) {
                p2stateno = 1;
                jQuery("#2P_M").val("1");
                p2getdata_fromjson();
                stop();
            }
        }

        if (isNext == true) {
            isNext = false;
            stop();
            return;
        }
        if (isPaused != true) {
            animid = window.requestAnimationFrame((ts) => loop(ts));
        }
    }, 1000 / 60);
}

function setloadfunc(obj) {
    obj.onload = function () {
        imgCount++;
        if (imgCount == p1_img.length + p2_img.length + boost_img.length + 1) next();
    };
}

function loadImage() {
    p1_img = [];
    p2_img = [];
    for (var i = 0; i < p1elem.length; i++) {
        p1_img.push(new Image());
    }
    for (var i = 0; i < p2elem.length; i++) {
        p2_img.push(new Image());
    }

    stage_img.src = "tokistage.jpg";
    for (var i = 0; i < p1elem.length; i++) {
        p1_img[i].src =
            "https://tikinaga.xyz/achokuto_database/wp-content/uploads/" +
            char[p1char] +
            "_" +
            p1stateno +
            "_" +
            p1image[i] +
            ".png";
        setloadfunc(p1_img[i]);
    }
    for (var i = 0; i < p2elem.length; i++) {
        p2_img[i].src =
            "https://tikinaga.xyz/achokuto_database/wp-content/uploads/" +
            char[p2char] +
            "_" +
            p2stateno +
            "_" +
            p2image[i] +
            ".png";
        setloadfunc(p2_img[i]);
    }
}

function loadImage_boost() {
    for (var i = 0; i < 32; i++) {
        boost_img[i] = new Image();
        boost_img[i].src =
            "https://tikinaga.xyz/achokuto_database/wp-content/uploads/boost_" + i + ".png";
        setloadfunc(boost_img[i]);
    }
}

function stop() {
    window.cancelAnimationFrame(animid);
    isPaused = true;
}

function start() {
    if (isPaused == true) {
        animid = window.requestAnimationFrame((ts) => loop(ts));
        isPaused = false;
    }
}

function next() {
    if (isPaused == true) {
        animid = window.requestAnimationFrame((ts) => loop(ts));
    }
    isNext = true;
}

function setup_pos() {
    p1v["x"] = 0;
    p1v["y"] = 0;
    p2v["x"] = 0;
    p2v["y"] = 0;
    if (p1y_ < 984) {
        p1push["current"] = p1push["air"];
    } else if (
        p1y_ >= 984 &&
        p1stateno != "1" &&
        p1stateno != "2" &&
        p1stateno != "2a" &&
        p1stateno != "2b" &&
        p1stateno != "2c" &&
        p1stateno != "2d"
    ) {
        p1push["current"] = p1push["stand"];
    } else {
        p1push["current"] = p1push["crouch"];
    }
    if (p2y < 984) {
        p2push["current"] = p2push["air"];
    } else if (
        p2y >= 984 &&
        p2stateno != "1" &&
        p2stateno != "2" &&
        p2stateno != "2a" &&
        p2stateno != "2b" &&
        p2stateno != "2c" &&
        p2stateno != "2d"
    ) {
        p2push["current"] = p2push["stand"];
    } else {
        p2push["current"] = p2push["air"];
    }
    if (p1boostno >= 0) {
        p1v["x"] += boost[p1boostno];
        p1boostno++;
        if (p1boostno >= boost.length) p1boostno = -1;
        jQuery("#p1boost").prop("checked", false);
    }
    if (p2boostno >= 0) {
        p2v["y"] += boost[p2boostno];
        p2boostno++;
        if (p2boostno >= boost.length) p2boostno = -1;
        jQuery("#p2boost").prop("checked", false);
    }
    for (var i = 0; i < p1movement.length; i++) {
        if (p1movement[i]["time"] == p1timeno) {
            p1v["x"] += parseFloat(p1movement[i]["x"]);
            p1v["y"] += parseFloat(p1movement[i]["y"]);
        }
    }
    for (var i = 0; i < p2movement.length; i++) {
        if (p2movement[i]["time"] == p2timeno) {
            p2v["x"] += parseFloat(p2movement[i]["x"]);
            p2v["y"] += parseFloat(p2movement[i]["y"]);
        }
    }
}

function posaddvel() {
    var p1x_ = p1x + p1v["x"] * p1facing;
    var p1y_ = p1y + p1v["y"];
    var p2x_ = p2x + p2v["x"] * p2facing;
    var p2y_ = p2y + p2v["y"];
    var mx1, my1, mx2, my2, ex1, ey1, ex2, ey2;
    mx1 = p1x_ + p1push["current"]["x1"] * p1facing;
    my1 = p1y_ + p1push["current"]["y1"];
    mx2 = mx1 + p1push["current"]["x2"] * p1facing;
    my2 = my1 + p1push["current"]["y2"];
    if (mx1 > mx2) {
        var temp = mx1;
        mx1 = mx2;
        mx2 = temp;
    }
    ex1 = p2x + p2push["current"]["x1"] * p2facing;
    ey1 = p2y + p2push["current"]["y1"];
    ex2 = ex1 + p2push["current"]["x2"] * p2facing;
    ey2 = ey1 + p2push["current"]["y2"];
    if (ex1 > ex2) {
        var temp = ex1;
        ex1 = ex2;
        ex2 = temp;
    }
    if (mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2) {
        if (ex1 - mx2 < p1v["x"] / 2) {
            p1move(p1v["x"], p1v["y"]);
        } else {
            p1move(p1v["x"] / 2, p1v["y"] / 2);
        }
        p2move(p1x + p1push["current"]["x2"] + p2puch["current"]["x2"] - p2x, 0);
    }

    mx1 = p2x_ + p2push["current"]["x1"] * p2facing;
    my1 = p2y_ + p2push["current"]["y1"];
    mx2 = mx1 + p2push["current"]["x2"] * p2facing;
    my2 = my1 + p2push["current"]["y2"];
    if (mx1 > mx2) {
        var temp = mx1;
        mx1 = mx2;
        mx2 = temp;
    }
    ex1 = p1x + p1push["current"]["x1"] * p1facing;
    ey1 = p1y + p1push["current"]["y1"];
    ex2 = ex1 + p1push["current"]["x2"] * p1facing;
    ey2 = ey1 + p1push["current"]["y2"];
    if (ex1 > ex2) {
        var temp = ex1;
        ex1 = ex2;
        ex2 = temp;
    }
    if (mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2) {
        if (ex1 - mx2 < p1v["x"] / 2) {
            p1move(p1v["x"], p1v["y"]);
        } else {
            p1move(p1v["x"] / 2, p1v["y"] / 2);
        }
        p2move(p1x + p1push["current"]["x2"] + p2puch["current"]["x2"] - p2x, 0);
    }
}

function p1move(x, y) {
    x = parseFloat(x);
    y = parseFloat(y);
    p1x += x * p1facing;
    p1y += y;
    if (p1x < 0) {
        p1x = 0;
    }
    if (p1x > 1280 - p1push[""]) {
        p1x = 1280;
    }
    if (p1y < -64) {
        p1y = -64;
    }
    if (p1y > 984) {
        p1y = 984;
    }
}

function p2move(x, y) {
    p2x += x * p2facing;
    p2y += y;
    if (p2x < 0) p2x = 0;
    if (p2x > 1280) p2x = 1280;
    if (p2y < -64) p2y = -64;
    if (p2y > 984) p2y = 984;
}

function setp1char(charid) {
    p1char = charid;
    p1getdata_fromjson();
}

function setp2char(charid) {
    p2char = charid;
    p2getdata_fromjson();
}

function setp1state(stateno) {
    p1stateno = stateno;
    stop();
    p1getdata_fromjson();
}

function setp2state(stateno) {
    p2stateno = stateno;
    stop();
    p2getdata_fromjson();
}
("use strict");
function p1getdata_fromjson() {
    jQuery(function ($) {
        $.ajax({
            url: MY_AJAX.api,
            type: "post",
            data: {
                // 呼び出すアクション名
                action: MY_AJAX.action,
                // アクションに対応するnonce
                nonce: MY_AJAX.nonce,
                // ▼ その他 渡したいデータがあれば適時 ▼
                characterid: p1char,
                stateno: p1stateno,
            },
        })
            .done(function (res) {
                p1res = res;
                p1timeno = 0;
                p1elemno = 0;
                p1elemtime = 0;
                p1time = p1res["state"]["time"];
                p1elem = Array(p1res["elem"].length);
                p1image = Array(p1res["elem"].length);
                p1offset["x"] = Array(p1res["elem"].length);
                p1offset["y"] = Array(p1res["elem"].length);
                for (var i = 0; i < p1res["elem"].length; i++) {
                    p1elem[p1res["elem"][i]["elemno"]] = p1res["elem"][i]["time"];
                    p1image[p1res["elem"][i]["elemno"]] = p1res["elem"][i]["imageno"];
                    p1offset["x"][p1res["elem"][i]["elemno"]] = p1res["elem"][i]["image_x"];
                    p1offset["y"][p1res["elem"][i]["elemno"]] = p1res["elem"][i]["image_y"];
                }

                p1hitbox = Array(res["hitbox"].length);
                for (var i = 0; i < p1hitbox.length; i++) {
                    p1hitbox[i] = [];
                }
                for (var i = 0; i < res["hitbox"].length; i++) {
                    var hitbox = [];
                    hitbox.push(res["hitbox"][i]["x"]);
                    hitbox.push(res["hitbox"][i]["y"]);
                    hitbox.push(res["hitbox"][i]["w"]);
                    hitbox.push(res["hitbox"][i]["h"]);
                    hitbox.push(res["hitbox"][i]["attr"]);
                    p1hitbox[res["hitbox"][i]["elemno"]].push(hitbox);
                }
                p1push["stand"]["x1"] = res["state"]["push_s_x1"];
                p1push["stand"]["y1"] = res["state"]["push_s_y1"];
                p1push["stand"]["x2"] = res["state"]["push_s_x2"];
                p1push["stand"]["y2"] = res["state"]["push_s_y2"];
                p1push["crouch"]["x1"] = res["state"]["push_c_x1"];
                p1push["crouch"]["y1"] = res["state"]["push_c_y1"];
                p1push["crouch"]["x2"] = res["state"]["push_c_x2"];
                p1push["crouch"]["y2"] = res["state"]["push_c_y2"];
                p1push["air"]["x1"] = res["state"]["push_a_x1"];
                p1push["air"]["y1"] = res["state"]["push_a_y1"];
                p1push["air"]["x2"] = res["state"]["push_a_x2"];
                p1push["air"]["y2"] = res["state"]["push_a_y2"];

                p1movement = res["movement"];
                p2getdata_fromjson();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown, arguments);
            });
    });
}

("use strict");
function p2getdata_fromjson() {
    jQuery(function ($) {
        $.ajax({
            url: MY_AJAX.api,
            type: "post",
            data: {
                // 呼び出すアクション名
                action: MY_AJAX.action,
                // アクションに対応するnonce
                nonce: MY_AJAX.nonce,
                // ▼ その他 渡したいデータがあれば適時 ▼
                characterid: p2char,
                stateno: p2stateno,
            },
        })
            .done(function (res) {
                p2res = res;
                p2timeno = 0;
                p2elemno = 0;
                p2elemtime = 0;
                p2time = p2res["state"]["time"];
                p2elem = Array(p2res["elem"].length);
                p2image = Array(p2res["elem"].length);
                p2offset["x"] = Array(p2res["elem"].length);
                p2offset["y"] = Array(p2res["elem"].length);
                for (var i = 0; i < p2res["elem"].length; i++) {
                    p2elem[p2res["elem"][i]["elemno"]] = p2res["elem"][i]["time"];
                    p2image[p2res["elem"][i]["elemno"]] = p2res["elem"][i]["imageno"];
                    p2offset["x"][p2res["elem"][i]["elemno"]] = p2res["elem"][i]["image_x"];
                    p2offset["y"][p2res["elem"][i]["elemno"]] = p2res["elem"][i]["image_y"];
                }

                p2hitbox = Array(res["hitbox"].length);
                for (var i = 0; i < p2hitbox.length; i++) {
                    p2hitbox[i] = [];
                }
                for (var i = 0; i < res["hitbox"].length; i++) {
                    var hitbox = [];
                    hitbox.push(res["hitbox"][i]["x"]);
                    hitbox.push(res["hitbox"][i]["y"]);
                    hitbox.push(res["hitbox"][i]["w"]);
                    hitbox.push(res["hitbox"][i]["h"]);
                    hitbox.push(res["hitbox"][i]["attr"]);
                    p2hitbox[res["hitbox"][i]["elemno"]].push(hitbox);
                }
                p2push["stand"]["x1"] = res["state"]["push_s_x1"];
                p2push["stand"]["y1"] = res["state"]["push_s_y1"];
                p2push["stand"]["x2"] = res["state"]["push_s_x2"];
                p2push["stand"]["y2"] = res["state"]["push_s_y2"];
                p2push["crouch"]["x1"] = res["state"]["push_c_x1"];
                p2push["crouch"]["y1"] = res["state"]["push_c_y1"];
                p2push["crouch"]["x2"] = res["state"]["push_c_x2"];
                p2push["crouch"]["y2"] = res["state"]["push_c_y2"];
                p2push["air"]["x1"] = res["state"]["push_a_x1"];
                p2push["air"]["y1"] = res["state"]["push_a_y1"];
                p2push["air"]["x2"] = res["state"]["push_a_x2"];
                p2push["air"]["y2"] = res["state"]["push_a_y2"];

                p2movement = res["movement"];
                loadImage();
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR, textStatus, errorThrown, arguments);
            });
    });
}

function p1boost(ischecked) {
    if (ischecked == true) {
        p1boostno = 0;
        p1boost_x = p1x;
        p1boost_y = p1y;
    } else p1boostno = -1;
}

function p2boost(ischecked) {
    if (ischecked == true) {
        p2boostno = 0;
        p2boost_x = p2x;
        p2boost_y = p2y;
    } else p2boostno = 0;
}

function reset() {
    p1x = 480.0;
    p1y = 984.0;
    p1boostno = -1;
    p1stateno = 0;
    jQuery("#1P_M").val("0");
    jQuery("#p1boost").prop("checked", false);
    p2x = 800.0;
    p27 = 984.0;
    p2boostno = -1;
    p2stateno = 0;
    jQuery("#2P_M").val("0");
    jQuery("#p2boost").prop("checked", false);
    p1getdata_fromjson();
    next();
}

function collision_check() {
    var p1hit = false;
    var p2hit = false;
    var clash = false;
    var p1hitbox_r = [];
    var p1hitbox_b = [];
    var p2hitbox_r = [];
    var p2hitbox_b = [];
    context.fillStyle = "white";
    context.font = "20px 'MS Pゴシック'";

    //データ分別
    for (var i = 0; i < p1hitbox[p1elemno].length; i++) {
        var hitbox = [];
        if (p1hitbox[p1elemno][i][4] == "R") {
            hitbox["x"] = parseInt(p1hitbox[p1elemno][i][0]);
            hitbox["y"] = parseInt(p1hitbox[p1elemno][i][1]);
            hitbox["w"] = parseInt(p1hitbox[p1elemno][i][2]);
            hitbox["h"] = parseInt(p1hitbox[p1elemno][i][3]);
            p1hitbox_r.push(hitbox);
        } else if (p1hitbox[p1elemno][i][4] == "B") {
            hitbox["x"] = parseInt(p1hitbox[p1elemno][i][0]);
            hitbox["y"] = parseInt(p1hitbox[p1elemno][i][1]);
            hitbox["w"] = parseInt(p1hitbox[p1elemno][i][2]);
            hitbox["h"] = parseInt(p1hitbox[p1elemno][i][3]);
            p1hitbox_b.push(hitbox);
        }
    }

    for (var i = 0; i < p2hitbox[p2elemno].length; i++) {
        var hitbox = [];
        if (p2hitbox[p2elemno][i][4] == "R") {
            hitbox["x"] = parseInt(p2hitbox[p2elemno][i][0]);
            hitbox["y"] = parseInt(p2hitbox[p2elemno][i][1]);
            hitbox["w"] = parseInt(p2hitbox[p2elemno][i][2]);
            hitbox["h"] = parseInt(p2hitbox[p2elemno][i][3]);
            p2hitbox_r.push(hitbox);
        } else if (p2hitbox[p2elemno][i][4] == "B") {
            hitbox["x"] = parseInt(p2hitbox[p2elemno][i][0]);
            hitbox["y"] = parseInt(p2hitbox[p2elemno][i][1]);
            hitbox["w"] = parseInt(p2hitbox[p2elemno][i][2]);
            hitbox["h"] = parseInt(p2hitbox[p2elemno][i][3]);
            p2hitbox_b.push(hitbox);
        }
    }

    //相殺判定
    for (var i = 0; i < p1hitbox_r.length; i++) {
        var mx1 = p1x + p1hitbox_r[i]["x"] * p1facing;
        var my1 = p1y + p1hitbox_r[i]["y"];
        var mx2 = mx1 + p1hitbox_r[i]["w"] * p1facing;
        var my2 = my1 + p1hitbox_r[i]["h"];
        if (mx1 > mx2) {
            var temp = mx1;
            mx1 = mx2;
            mx2 = temp;
        }
        for (var j = 0; j < p2hitbox_r.length; j++) {
            var ex1 = p2x + p2hitbox_r[j]["x"] * p2facing;
            var ey1 = p2y + p2hitbox_r[j]["y"];
            var ex2 = ex1 + p2hitbox_r[j]["w"] * p2facing;
            var ey2 = ey1 + p2hitbox_r[j]["h"];
            if (ex1 > ex2) {
                var temp = ex1;
                ex1 = ex2;
                ex2 = temp;
            }
            if (mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2) {
                clash = true;
            }
        }
    }
    if (clash == false) {
        //P1ヒット判定
        for (var i = 0; i < p1hitbox_r.length; i++) {
            var mx1 = p1x + p1hitbox_r[i]["x"] * p1facing;
            var my1 = p1y + p1hitbox_r[i]["y"];
            var mx2 = mx1 + p1hitbox_r[i]["w"] * p1facing;
            var my2 = my1 + p1hitbox_r[i]["h"];
            if (mx1 > mx2) {
                var temp = mx1;
                mx1 = mx2;
                mx2 = temp;
            }
            for (var j = 0; j < p2hitbox_b.length; j++) {
                var ex1 = p2x + p2hitbox_b[j]["x"] * p2facing;
                var ey1 = p2y + p2hitbox_b[j]["y"];
                var ex2 = ex1 + p2hitbox_b[j]["w"] * p2facing;
                var ey2 = ey1 + p2hitbox_b[j]["h"];
                if (ex1 > ex2) {
                    var temp = ex1;
                    ex1 = ex2;
                    ex2 = temp;
                }
                if (mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2) {
                    p1hit = true;
                }
            }
        }

        //P2ヒット判定
        for (var i = 0; i < p2hitbox_r.length; i++) {
            var mx1 = p2x + p2hitbox_r[i]["x"] * p2facing;
            var my1 = p2y + p2hitbox_r[i]["y"];
            var mx2 = mx1 + p2hitbox_r[i]["w"] * p2facing;
            var my2 = my1 + p2hitbox_r[i]["h"];
            if (mx1 > mx2) {
                var temp = mx1;
                mx1 = mx2;
                mx2 = temp;
            }
            for (var j = 0; j < p1hitbox_b.length; j++) {
                var ex1 = p1x + p1hitbox_b[j]["x"] * p1facing;
                var ey1 = p1y + p1hitbox_b[j]["y"];
                var ex2 = ex1 + p1hitbox_b[j]["w"] * p1facing;
                var ey2 = ey1 + p1hitbox_b[j]["h"];
                if (ex1 > ex2) {
                    var temp = ex1;
                    ex1 = ex2;
                    ex2 = temp;
                }
                if (mx1 <= ex2 && ex1 <= mx2 && my1 <= ey2 && ey1 <= my2) {
                    p2hit = true;
                }
            }
        }
    }
    if (clash) {
        context.textAlign = "left";
        context.fillText("△", 10, 50);
        context.textAlign = "right";
        context.fillText("△", 630, 50);
    }
    if (p1hit) {
        context.textAlign = "left";
        context.fillText("◯", 10, 50);
    } else if (p2hit) {
        context.textAlign = "left";
        context.fillText("×", 10, 50);
    }
    if (p2hit) {
        context.textAlign = "right";
        context.fillText("◯", 630, 50);
    } else if (p1hit) {
        context.textAlign = "right";
        context.fillText("×", 630, 50);
    }
    if (p1hit || p2hit || clash) {
        context.textAlign = "left";
        context.fillText(state[p1stateno], 10, 20);
        context.textAlign = "right";
        context.fillText(state[p2stateno], 630, 20);
    }

    if (p1hit && p2hit) return "trade";
    else if (p1hit) return "p1";
    else if (p2hit) return "p2";
    else if (clash) return "clash";
    else return "";
}

function cameramove() {
    //X軸
    stageoffset["x"] = -320 - (p1x + p2x) / 2 + 640;
    if (stageoffset["x"] > 0) {
        stageoffset["x"] = 0;
    } else if (stageoffset["x"] < -640) {
        stageoffset["x"] = -640;
    }

    //Y軸
    if (p1y < 750 && p2y >= 750) {
        stageoffset["y"] = -544 + (750 - p1y);
        if (stageoffset["y"] > -300) stageoffset["y"] = -300;
    } else if (p1y >= 750 && p2y <= 750) {
        stageoffset["y"] = -544 + (750 - p2y);
        if (stageoffset["y"] > -300) stageoffset["y"] = -300;
    } else if (p1y < 750 && p2y < 750) {
        stageoffset["y"] = -544 - (p1y + p2y) / 2 - 984;
    } else {
        stageoffset["y"] = -544;
    }
}

/*
function collisionRect(mx1, my1, mx2, my2, ex1, ey1, ex2, ey2) {
    var result = [];
    if (mx1 <= ex1) {
        result['x'] = ex1;
        result['w'] = mx2 - ex1;
    } else {
        result['x'] = mx1;
        result['w'] = ex2 - mx1;
    }
    if (my1 < ey1) {
        result['y'] = ey1;
        result['h'] = my2 - ey1;
    } else {
        result['y'] = my1
        result['h'] = ey2 - my1;
    }
    
    context.fillStyle = "rgba(" + [255, 200, 200, 0.8] + ")";
    context.fillRect(result['x'] + stageoffset['x'], result['y'] + stageoffset['y'], result['w'], result['h']);
}
*/
