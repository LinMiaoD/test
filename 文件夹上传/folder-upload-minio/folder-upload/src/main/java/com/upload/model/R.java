package com.upload.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class R<T> {
    private boolean success;
    private String  message;
    private T       data;

    public static <T> R<T> ok(T data)                  { return new R<>(true,  "ok",    data); }
    public static <T> R<T> ok(String msg, T data)       { return new R<>(true,  msg,     data); }
    public static <T> R<T> fail(String msg)             { return new R<>(false, msg,     null); }
}
