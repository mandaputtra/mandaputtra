---
tags: ["javascript", "ffmpeg"]
title: "Mantain consistent .mp4 video compression with FFmpeg"
description: "Make your compression with bitrate smooth"
date: 2019-12-31
---

So you maybe already know [`ffmpeg`](https://www.ffmpeg.org/) the popular library for video compression, stream, and they had many though you can check that on their website.

Recently I found nice article about [compressing using FFmpeg](https://dev.to/benjaminblack/use-ffmpeg-to-compress-and-convert-videos-458l)

on that article this guy using bitrate to compress the `.mp4` file. But to compress files that had size 1Mb to 10Mb that script makes it bigger ~ not make the video smaller.

I had some project that requires video compression back then I do that with scaling (cause it's faster than bitrate compression) found on this [StackOverflow answer](https://unix.stackexchange.com/a/447521/362526):

My old project usually uses it, but now I had a use case when I can't scale the video to maintain its original size, so after found that guy answer I just want to share some script here.

```js
/* eslint-disable no-new */
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static").path;
const ffprobePath = require("ffprobe-static").path;
const path = require("path");
const uuid = require("uuid/v3");

// video path
const videoPath = path.join(__dirname, "video", "output.mp4");
// set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

/**
 * Extract Metadata from a video
 * @param {String} path
 */
function metadata(path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        reject(err);
      }
      resolve(metadata);
    });
  });
}

/**
 * FFmpeg commaand to compress video
 * @param {String} input
 * Path to input file
 * @param {String} output
 * Path to output file
 * @param {Number} bitrate
 * The bitrate you specify to compress video in bytes
 */
function command(input, output, bitrate) {
  return new Promise((resolve, reject) => {
    ffmpeg(input)
      .outputOptions([
        "-c:v libx264",
        `-b:v ${bitrate}k`,
        "-c:a aac",
        "-b:a 58k",
      ])
      .output(output)
      .on("start", (command) => {
        console.log("TCL: command -> command", command);
      })
      .on("error", (error) => reject(error))
      .on("end", () => resolve())
      .run();
  });
}

/**
 * Choose the right bitrate for video based on Size
 * @param {Number} bytes
 */
function whatBitrate(bytes) {
  const ONE_MB = 1000000;
  const BIT = 28; // i found that 28 are good point fell free to change it as you feel right
  const diff = Math.floor(bytes / ONE_MB);
  if (diff < 5) {
    return 128;
  } else {
    return Math.floor(diff * BIT * 1.1);
  }
}

// this compress video based on bitrate
async function compress() {
  const name = uuid(videoPath, "1b671a64-40d5-491e-99b0-da01ff1f3341");
  const outputPath = path.join(__dirname, "video", `${name}.mp4`);
  const inputMetadata = await metadata(videoPath);
  const bitrate = whatBitrate(inputMetadata.format.size);
  await command(videoPath, outputPath, bitrate);
  const outputMetadata = await metadata(outputPath);

  return {
    old_size: inputMetadata.format.size,
    new_size: outputMetadata.format.size,
  };
}

compress()
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
```

the `28` and `1.1` are the one that works for me, you can change it, I know that my app would not handle more than 1GB so here is the list

| Original | Compressed | Bitrate |
| -------- | ---------- | ------- |
| 2.1Mb    | 1.4Mb      | 128k    |
| 10.2Mb   | 5.6Mb      | 308k    |
| 51Mb     | 31Mb       | 1570k   |

The audio is fine though.

