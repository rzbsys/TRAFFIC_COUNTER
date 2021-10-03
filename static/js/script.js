var time = [];
var car_cnt = [];
var id;
var Left_Time = 90;
var metime = [];
//평상시 0, 요청시 1, 오류시 -1, 종료대기 -2
var state = 0;
var Request_Time;

$('.setting').hide();
$('#CCTV-Box').hide();
$('.close-screen').hide();
sel(1);
$('#Close').on('click', () => {
    $('.setting').hide();
});

$('#Terminate').on('click', () => {
    if (!confirm('종료하시겠습니까?')) {
        return;
    }
    if (state == 0 || state == -1) {
        location.href = '/';
        return;
    }
    $('.close-screen').fadeIn();
    state = -2;
    clearInterval(Request_Time);
});

$('.set-btn').on('click', function () {
    $('.setting').fadeIn();
});

window.onload = () => {
    $('.load_back').fadeOut();
    setTimeout(() => {
        sel(2);
    }, 300);
}
function avg(arr) {
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum = sum + arr[i];
    }
    return sum / arr.length;
}

function zero(cnt) {
    if (cnt < 10) {
        return '0' + cnt;
    } else {
        return cnt;
    }
}

function get_date() {
    var today = new Date();
    var year = today.getFullYear();
    var month = zero(today.getMonth() + 1);
    var day = zero(today.getDate());
    return year + '-' + month + '-' + day;
}

function get_time() {
    var today = new Date();
    var hours = zero(today.getHours());
    var minutes = zero(today.getMinutes());
    var seconds = zero(today.getSeconds());
    return hours + ':' + minutes + ':' + seconds;
}

setInterval(() => {
    $('#Time').text('현재시간 : ' + get_time());
}, 1000);

function sel(i) {
    $('.load-r').hide();
    $('.select').hide();
    $('.pre').hide();

    switch (i) {
        case 1:
            $('.load-r').fadeIn();
            break;
        case 2:
            $('.select').fadeIn();
            break;
        case 3:
            $('.pre').fadeIn();
            break;
    }
    return;
}

function renewal() {
    sel(3);
    var Start_Time = new Date();
    state = 1;
    $.ajax({
        type: "POST",
        url: "/load_pre",
        data: {
            'id': id
        },
        success: (res) => {
            if (state == -2) {
                location.href = '/';
                return;
            }
            $('#CCTV-Vid').attr('src', res['res']);
            var vid = $("#CCTV-Vid").get(0);
            var playPromise = vid.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                })
                    .catch(error => {
                        //alert('영상 재생 불가능');
                    });
            }
            $('#SelText').hide();
            $('#CCTV-Box').fadeIn();
            car_cnt.push(parseInt(res['cnt']));
            var series = chart.series[0],
                shift = series.data.length > 20;
            chart.series[0].addPoint([get_date() + ' ' + get_time(), res['cnt']], true, shift);
            state = 0;
            var End_Time = new Date();
            metime.push(End_Time - Start_Time);
            $('#Exc_Time').text((avg(metime) / 1000).toFixed(2) + '초');
            $('#Close_time').text('약 ' + ((avg(metime) / 1000).toFixed(2) - (90 - Left_Time)) + '초 소요됩니다.');
        },
        error: (e) => {
            console.log(e);
            state = -1;
        }
    });
}





$('.recommend').on('click', (e) => {
    Request_Time = setInterval(() => {
        $('#Reload').text(Left_Time + '초');
        Left_Time = Left_Time - 1;
        if (Left_Time <= 0) {
            if (state == 0) {
                renewal();
            } else if (state == 1) {
                $('#State').text('연산 속도 느림');
            }
            Left_Time = 90;
        } else {
            if (state == 0) {
                $('#Status').text('재생중');
            } else if (state == 1) {
                $('#Status').text('새로고침 요청');
            } else if (state == -1) {
                $('#Status').text('새로고침 실패');
            }
        }
    }, 1000);
    sel(1);
    $('#CCTV-Box').hide();
    $('#SelText').html('실시간 CCTV데이터를 다운받은 후<br>영상을 처리하고 있습니다.');
    $('#SelText').show();
    const target = $(e.currentTarget);
    $('.position').text(target.data('name'));
    id = target.data('id')
    renewal();
});


$('#Set').on('click', () => {
    $('.setting').hide();
    $.ajax({
        type: "POST",
        url: "/setting",
        data: {
            'CONF': $('#NUM').val()
        },
        success: (res) => {
            console.log(res);
        },
        error: (e) => {
            alert('설정 변경에 실패하였습니다.');
        }
    });
});

var flag = 0;

$('.tooltip').on('click', () => {
    if (flag == 0) {
        $('.tooltip').css('opacity', '0.1');
        flag = 1;
    } else {
        $('.tooltip').css('opacity', '');
        flag = 0;
    }
});

var chart = new Highcharts.Chart({
    chart: {
        renderTo: 'data-container',
        backgroundColor: null,
        height: 180,
        width: 500,
        marginTop: 20
    },
    title: {
        text: null
    },
    xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        maxZoom: 20 * 1000,
        title: null,
        color: null,
        labels: {
            enabled: false,
        }
    },
    yAxis: {
        minPadding: 0.2,
        maxPadding: 0.2,
        title: null
    },
    series: [{
        name: 'Car Count',
        data: [],
        showInLegend: false,
        pointInterval: 1000 * 100

    }],
    credits: {
        enabled: false
    }

});


$('#Download').on('click', () => {
    location.href = '/download';
});