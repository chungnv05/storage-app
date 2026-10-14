package org.clouddrive.common.util;

public class NameUtil {

    public static String[] splitFullName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[]{"", ""};
        }

        String normalizedName = fullName.trim().replaceAll("\\s+", " ");
        int lastSpaceIndex = normalizedName.lastIndexOf(' ');

        if (lastSpaceIndex == -1) {
            return new String[]{"", normalizedName};
        }

        String lastName = normalizedName.substring(0, lastSpaceIndex);
        String firstName = normalizedName.substring(lastSpaceIndex + 1);

        return new String[]{firstName, lastName};
    }
}