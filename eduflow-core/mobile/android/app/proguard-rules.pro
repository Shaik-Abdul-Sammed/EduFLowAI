# EduFlow AI ProGuard / R8 Rules for Release Build

# Flutter Wrapper
-keep class io.flutter.app.** { *; }
-keep class io.flutter.plugin.**  { *; }
-keep class io.flutter.util.**  { *; }
-keep class io.flutter.view.**  { *; }
-keep class io.flutter.**  { *; }
-keep class io.flutter.plugins.**  { *; }

# Preserve annotations and generic signatures
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep data models used for JSON serialization
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# AndroidX and Material Components
-dontwarn com.google.android.material.**
-keep class com.google.android.material.** { *; }

# Networking and OkHttp/Retrofit if used
-dontwarn okhttp3.**
-dontwarn okio.**
