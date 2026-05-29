package com.engineerspool.util;

import java.text.DecimalFormat;

public final class FileSizeFormatter {

    private static final DecimalFormat FORMAT = new DecimalFormat("#,##0.#");

    private FileSizeFormatter() {
    }

    public static String humanReadable(long bytes) {
        if (bytes < 1024) {
            return bytes + " B";
        }
        double kb = bytes / 1024.0;
        if (kb < 1024) {
            return FORMAT.format(kb) + " KB";
        }
        double mb = kb / 1024.0;
        if (mb < 1024) {
            return FORMAT.format(mb) + " MB";
        }
        return FORMAT.format(mb / 1024.0) + " GB";
    }
}
