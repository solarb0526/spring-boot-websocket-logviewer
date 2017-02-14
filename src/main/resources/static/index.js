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
    var $logArea = $("#log-area");

    $dir.val('c:/temp');

    stompClient.connect({}, function (frame) {
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/appendMessage', function (message) {
            $logArea.append($('<p></p>').text(message.body));
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
            var $p = $('<p></p>').text(message.body);
            $logArea.append($p);
            if(!$('#pause-auto-scroll').prop('checked')) $(window).scrollTop($(document).height());
            var useFilter = $('#use-filter').prop('checked');
            if(!useFilter) return;
            handleFilter($p);
        });
        stompClient.subscribe('/topic/sendInitialDir', function (message) {
            $dir.val(message.body);
        });
        $dir.change(function(){
            stompClient.send("/app/dir_change", {}, JSON.stringify({dir: $dir.val()}));
        }).change();
        $fileNames.change(function(){
            $logArea.empty();
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
        $('#clear-log').click(function(){
            $logArea.empty();
        });
        $('#use-filter').change(function(){
            $logArea.find('p').show();
            var useFilter = $('#use-filter').prop('checked');
            if(!useFilter) return;
            $logArea.find('p').each(function(){
                handleFilter($(this));
            });
        });
        $('#filter-condition').change(function(){
            $('#use-filter').change();
        });

        function handleFilter($p) {
            var text = $p.text();
            var regExp = new RegExp($('#filter-condition').val());
            if(!regExp.test(text)) $p.hide();
        }
    });
});
