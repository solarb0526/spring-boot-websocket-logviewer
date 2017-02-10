/**
 * Created by Administrator on 2017-02-10.
 */
$(function () {
    $('form').submit(function(e){
        e.preventDefault();
    });

    var socket = new SockJS('/gs-guide-websocket');
    var stompClient = Stomp.over(socket);
    stompClient.debug = false;
    var $dir = $("#dir");
    var $fileNames = $("#file-names");
    var $toggleGenerateLog = $('#toggle-generate-log');
    var $logMessage = $('#log-message');

    $dir.val('c:/temp');

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/appendMessage', function (message) {
            $("#log-area").append("<tr><td>" + message.body + "</td></tr>");
        });
        stompClient.subscribe('/topic/sendFileNames', function (message) {
            var options = [];
            var fileNames = JSON.parse(message.body);
            $.each(fileNames, function () {
                options.push($('<option></option>').text(this).val(this));
            });
            $fileNames.empty();
            $fileNames.append(options);
        });
        stompClient.subscribe('/topic/appendLog', function (message) {
            $("#log-area").append(message.body + '\n');
            if(!$('#pause-auto-scroll').prop('checked')) $(window).scrollTop($(document).height());
        });
        stompClient.subscribe('/topic/sendInitialDir', function (message) {
            $dir.val(message.body);
        });

        $dir.change(function(){
            stompClient.send("/app/dir_change", {}, JSON.stringify({dir: $dir.val()}));
        }).change();

        $fileNames.change(function(){
            $("#log-area").empty();
            stompClient.send("/app/filename_change", {}, JSON.stringify({
                dir: $dir.val(),
                fileName: $fileNames.val()
            }));
        });
        $toggleGenerateLog.click(function(){
            stompClient.send("/app/toggleGenerateLog", {});
        });
        $('#append-custom-log').click(function(){
            stompClient.send("/app/appendCustomLog", {}, JSON.stringify({
                logMessage: $logMessage.val()
            }));
        });
        $('#append-custom-log-100').click(function(){
            for(var i=0; i<100; i++){
                stompClient.send("/app/appendCustomLog", {}, JSON.stringify({
                    logMessage: 'custom log ' + i
                }));
            }
        });
    });
});
