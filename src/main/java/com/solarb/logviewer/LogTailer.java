package com.solarb.logviewer;

import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListener;
import org.apache.commons.io.input.TailerListenerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;

/**
 * Created by Administrator on 2017-02-09.
 */
@Component
public class LogTailer {
    @Autowired LogViewerMessageSender messageSender;
    Tailer tailer;
    public void changeLogFile(File file) throws IOException {


        messageSender.appendLog("open file for tail. file: " + file.getAbsolutePath());

        if(tailer != null) tailer.stop();

        TailerListener listener = new TailerListenerAdapter() {
            @Override
            public void handle(String line) {
                messageSender.appendLog(line);
            }
        };

        tailer = new Tailer(file, listener, 100, true);

        tailer.run();
    }
}
