package com.solarb.logviewer;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import javax.annotation.PostConstruct;
import java.io.File;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class LogViewerController {
    Logger logger = Logger.getLogger(LogViewerController.class);
    @Autowired
    LogViewerMessageSender messageSender;
    @Autowired
    LogTailer logTailer;

    boolean generateLog = false;


    @PostConstruct
    public void postConstruct() {
        new Thread(() -> {
            while (true) {
                try {
                    Thread.sleep(1000);
                    if(!generateLog) continue;
                    logger.info("generated log. currentTimeMillis: " + System.currentTimeMillis());
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    @Value("${logging.path}")
    private String loggingPath;

    @SendTo("/topic/sendFileNames")
    public Map<String, List<String>> sendFileNames(String dir) throws Exception {
        Collection<File> files = FileUtils.listFiles(new File(dir), new String[]{"log"}, true);
        Map<String, List<String>> map = new HashMap<>();
        map.put("fileNames", files.stream().map(File::getName).collect(Collectors.toList()));
        return map;
    }

    @MessageMapping("/dir_change")
    public void dir_change(Map<String, String> map) throws Exception {
        String dir = map.get("dir");
        if (StringUtils.isEmpty(dir)) {
            messageSender.sendInitialDir(loggingPath);
            return;
        }

        File _dir = new File(dir);
        if (!_dir.isDirectory()) {
            messageSender.appendMessage("given dir value is not a directory. dir: " + dir);
            return;
        }

        messageSender.sendFileNames(dir);
    }

    @MessageMapping("/filename_change")
    public void filename_change(Map<String, String> map) throws Exception {
        String dir = map.get("dir");
        String fileName = map.get("fileName");
        logTailer.changeLogFile(new File(dir, fileName));
    }

    @MessageMapping("/toggleGenerateLog")
    public void toggleGenerateLog() throws Exception {
        generateLog = !generateLog;
    }

    @MessageMapping("/appendCustomLog")
    public void appendCustomLog(Map<String, String> map) throws Exception {
        logger.info(map.get("logMessage"));
    }


}
