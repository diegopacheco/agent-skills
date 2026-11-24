package com.acme.shop.logging;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.spi.LoggingEventBuilder;

public final class AppLogger {
    private final Logger log;

    private AppLogger(Class<?> owner) {
        this.log = LoggerFactory.getLogger(owner);
    }

    public static AppLogger of(Class<?> owner) {
        return new AppLogger(owner);
    }

    public void info(String event, Map<String, Object> fields) {
        write(log.atInfo(), event, fields);
    }

    public void warn(String event, Map<String, Object> fields) {
        write(log.atWarn(), event, fields);
    }

    private void write(LoggingEventBuilder builder, String event, Map<String, Object> fields) {
        LoggingEventBuilder b = builder.setMessage(event).addKeyValue("service", "shop-backend");
        for (Map.Entry<String, Object> field : fields.entrySet()) {
            b = b.addKeyValue(field.getKey(), field.getValue());
        }
        b.log();
    }
}
