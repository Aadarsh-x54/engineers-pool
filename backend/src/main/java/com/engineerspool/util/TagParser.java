package com.engineerspool.util;

import java.util.Arrays;
import java.util.List;

public final class TagParser {

    private TagParser() {
    }

    public static List<String> parse(String rawTags) {
        if (rawTags == null || rawTags.isBlank()) {
            return List.of();
        }
        return Arrays.stream(rawTags.split(","))
                .map(String::trim)
                .filter(tag -> !tag.isBlank())
                .distinct()
                .limit(20)
                .toList();
    }
}
