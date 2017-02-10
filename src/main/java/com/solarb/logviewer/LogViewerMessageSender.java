package com.solarb.logviewer;

import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Created by Administrator on 2017-02-09.
 */
@Component
public class LogViewerMessageSender {
    @Autowired
    private SimpMessagingTemplate messageTemplate;

    public void appendMessage(String message) {
        messageTemplate.convertAndSend("/topic/appendMessage", message);
    }

    public void sendFileNames(String dir) throws Exception {
        Collection<File> files = FileUtils.listFiles(new File(dir), new String[]{"log"}, true);
        List<String> fileNames = files.stream().map(File::getName).collect(Collectors.toList());
        fileNames.add(0, "");
        messageTemplate.convertAndSend("/topic/sendFileNames", fileNames);
    }

    public void appendLog(String log) {
        messageTemplate.convertAndSend("/topic/appendLog", log);
    }

    public void sendInitialDir(String loggingPath){
        messageTemplate.convertAndSend("/topic/sendInitialDir", loggingPath);
    }
}
