package com.aryan.linkedinProject.userService.utils;

import static org.mindrot.jbcrypt.BCrypt.hashpw;
import static org.mindrot.jbcrypt.BCrypt.checkpw;
import static org.mindrot.jbcrypt.BCrypt.gensalt;

public class BCrypt {

    public static String hash(String s){
        return hashpw(s, gensalt());
    }

    public static boolean match(String passwordText, String passwordHashed){
        return checkpw(passwordText, passwordHashed);
    }

}
