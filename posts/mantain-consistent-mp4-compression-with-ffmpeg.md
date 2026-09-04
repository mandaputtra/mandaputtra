---
tags: ["javascript", "ffmpeg"]
title: "Maintain consistent .mp4 video compression with FFmpeg"
description: "Make your compression with bitrate smooth"
date: 2019-12-31
---

You probably know [`ffmpeg`](https://www.ffmpeg.org/), the popular toolkit for video compression and streaming. It does much more, check the website for details.

I found a useful article on [compressing video with FFmpeg](https://dev.to/benjaminblack/use-ffmpeg-to-compress-and-convert-videos-458l). It uses bitrate to compress `.mp4` files. When I applied that script to files from 1 MB to 10 MB, the output grew larger instead of smaller.

In an earlier project I compressed video by scaling, which runs faster than bitrate tuning, as described in this [StackOverflow answer](https://unix.stackexchange.com/a/447521/362526). That approach worked until I needed to preserve the original dimensions.

I adapted the bitrate approach to scale with file size. The script below chooses a bitrate based on input size and keeps dimensions intact.

## Choosing a bitrate that scales with file size

The constants `28` and `1.1` worked well for my case, which caps at about 1 GB. Adjust them to fit your constraints.

## Compressing video with fluent-ffmpeg

Set up `fluent-ffmpeg` with static binaries and define a helper to read metadata:

```js
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static").path;
const ffprobePath = require("ffprobe-static").path;
const path = require("path");
const uuid = require("uuid/v3");

const videoPath = path.join(__dirname, "video", "output.mp4");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function metadata(path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

Configure the `ffmpeg` command. This applies `libx264` for video and `aac` for audio with the chosen bitrate:

```js
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
      .on("start", (cmd) => console.log(cmd))
      .on("error", reject)
      .on("end", resolve)
      .run();
  });
}

function whatBitrate(bytes) {
  const ONE_MB = 1000000;
  const BIT = 28; // 28 is a good baseline, adjust as needed
  const diff = Math.floor(bytes / ONE_MB);
  if (diff < 5) return 128;
  return Math.floor(diff * BIT * 1.1);
}
```

Run the compression and compare input and output sizes:

```js
async function compress() {
  const name = uuid(videoPath, "1b671a64-40d5-491e-99b0-da01ff1f3341");
  const out = path.join(__dirname, "video", `${name}.mp4`);
  const inputMeta = await metadata(videoPath);
  const bitrate = whatBitrate(inputMeta.format.size);
  await command(videoPath, out, bitrate);
  const outputMeta = await metadata(out);
  return {
    old_size: inputMeta.format.size,
    new_size: outputMeta.format.size,
  };
}

compress()
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
```

The equivalent direct `ffmpeg` command looks like this:

```bash
# compress with libx264 at 308k video bitrate, keep audio at 58k
ffmpeg -i input.mp4 -c:v libx264 -b:v 308k -c:a aac -b:a 58k output.mp4
```

Tune `-b:v` to match the bitrate returned by `whatBitrate`. Lower values reduce size further but soften detail.

## Measured results

| Original | Compressed | Bitrate |
| -------- | ---------- | ------- |
| 2.1 MB   | 1.4 MB     | 128k    |
| 10.2 MB  | 5.6 MB     | 308k    |
| 51 MB    | 31 MB      | 1570k   |

Audio remains clear at 58k in these tests.
