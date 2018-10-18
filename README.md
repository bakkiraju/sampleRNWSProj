# sampleRNWSProj
Sample React native based android app for web sockets client usage demo

To run :
clone the repo to your computer

Open a  shell/terminal
> cd sampleRNWSProj

> npm install

To run on a android virtual device (AVD) simulator, star the simulator and then
> react-native run-android

To run on real android device
>  adb connect <device>
>  react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res && react-native run-android
