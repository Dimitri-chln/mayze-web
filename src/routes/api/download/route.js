const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const Fs = require('fs');
const Path = require('path');
const PlayDl = require('play-dl');
const ytdl = require('ytdl-core');

class Route extends BaseRoute {
	static path = '/api/download';
	static requireLogin = true;
	static requireMember = true;

	/**
	 * @param {URL} url
	 * @param {IncomingMessage} request
	 * @param {ServerResponse} response
	 * @param {string} token
	 */
	static async runValid(url, request, response, token) {
		const youtubeURL = url.searchParams.get('url');
		const runningDownloadId = url.searchParams.get('download_id');

		if (!youtubeURL && !runningDownloadId) {
			response.writeHead(400, { 'Content-Type': 'application/json' });
			response.write(
				JSON.stringify({
					status: 400,
					message: 'Bad Request',
				}),
			);
			return response.end();
		}

		if (youtubeURL) {
			const urlType = await PlayDl.validate(youtubeURL);

			const downloadId = Util.generateRandomString();

			Util.youtubeDownloads.set(downloadId, {
				url: youtubeURL,
				videos: [],
				finished: false,
			});

			const path = Path.join(
				__dirname,
				'..',
				'..',
				'..',
				'public',
				'static',
				'downloads',
			);

			let streamError = false;

			switch (urlType) {
				case 'yt_video': {
					const info = await ytdl.getInfo(youtubeURL);
					const filename = `${downloadId}.mp3`;
					const format = info.formats.find(
						(f) => f.audioQuality === 'AUDIO_QUALITY_MEDIUM',
					);

					Util.youtubeDownloads.get(downloadId).videos = [
						{
							url: info.videoDetails.video_url,
							name: info.videoDetails.title,
							progress: 0,
							finished: false,
						},
					];

					const writeStream = Fs.createWriteStream(Path.join(path, filename));
					const playStream = ytdl(youtubeURL, {
						format,
						requestOptions: {
							headers: {
								cookie: process.env.YOUTUBE_COOKIE,
							},
						},
					});
					let downloadedBytes = 0;

					playStream
						.on('data', (chunk) => {
							downloadedBytes += chunk.length;

							Util.youtubeDownloads.get(downloadId).videos[0].progress =
								downloadedBytes / parseInt(format.contentLength);
						})
						.on('finish', () => {
							Util.youtubeDownloads.get(downloadId).videos[0].finished = true;

							Util.youtubeDownloads.get(downloadId).finished = true;
							Util.youtubeDownloads.get(downloadId).filename = filename;
							Util.youtubeDownloads.get(downloadId).path = Path.join(
								path,
								filename,
							);
						})
						.on('error', (err) => {
							Fs.unlinkSync(Path.join(path, filename));
							streamError = true;

							response.writeHead(500, { 'Content-Type': 'application/json' });
							response.write(
								JSON.stringify({
									status: 500,
									message: 'Download Error',
								}),
							);
							return response.end();
						})
						.pipe(writeStream);
					break;
				}

				case 'yt_playlist': {
					const playlistInfo = await PlayDl.playlist_info(youtubeURL);
					const dirname = downloadId;
					Fs.mkdirSync(Path.join(path, dirname));

					const videos = await playlistInfo.all_videos();

					for (const [videoId, video] of videos.entries()) {
						Util.youtubeDownloads.get(downloadId).videos[videoId] = {
							url: video.url,
							name: video.title,
							progress: 0,
							finished: false,
						};
					}

					Promise.all(
						videos.map((video, videoId) => {
							return new Promise(async (resolve, reject) => {
								const info = await ytdl.getInfo(video.url);
								const filename = `${video.title
									.replace(/[^\w\s\(\)\[\]-]/g, ' ')
									.replace(/ +/g, ' ')}.mp3`;
								const format = info.formats.find(
									(f) => f.audioQuality === 'AUDIO_QUALITY_MEDIUM',
								);

								const writeStream = Fs.createWriteStream(
									Path.join(path, dirname, filename),
								);
								const playStream = ytdl(video.url, {
									format,
									requestOptions: {
										headers: {
											cookie: process.env.YOUTUBE_COOKIE,
										},
									},
								});
								let downloadedBytes = 0;

								playStream
									.on('data', (chunk) => {
										downloadedBytes += chunk.length;

										Util.youtubeDownloads.get(downloadId).videos[
											videoId
										].progress =
											downloadedBytes / parseInt(format.contentLength);
									})
									.on('finish', () => {
										Util.youtubeDownloads.get(downloadId).videos[
											videoId
										].finished = true;

										resolve();
									})
									.on('error', (err) => {
										Fs.unlinkSync(Path.join(path, dirname, filename));
										streamError = true;

										response.writeHead(500, {
											'Content-Type': 'application/json',
										});
										response.write(
											JSON.stringify({
												status: 500,
												message: 'Download Error',
											}),
										);
										return response.end();
									})
									.pipe(writeStream);
							});
						}),
					).then(async () => {
						await Util.zipDirectory(
							Path.join(path, dirname),
							`${Path.join(path, dirname)}.zip`,
						);

						Fs.rmSync(Path.join(path, dirname), { recursive: true });

						Util.youtubeDownloads.get(downloadId).finished = true;
						Util.youtubeDownloads.get(downloadId).filename = `${dirname}.zip`;
						Util.youtubeDownloads.get(downloadId).path = Path.join(
							path,
							`${dirname}.zip`,
						);
					});
					break;
				}

				default: {
					Util.youtubeDownloads.delete(downloadId);

					response.writeHead(400, { 'Content-Type': 'application/json' });
					response.write(
						JSON.stringify({
							status: 400,
							message: 'Invalid URL',
						}),
					);
					return response.end();
				}
			}

			if (streamError) return;

			response.writeHead(200, {
				'Content-Type': 'application/json',
			});
			response.write(
				JSON.stringify({
					download_id: downloadId,
				}),
			);
			response.end();
		}

		if (runningDownloadId) {
			const runningDownload = Util.youtubeDownloads.get(runningDownloadId);

			if (!runningDownload) {
				response.writeHead(400, { 'Content-Type': 'application/json' });
				response.write(
					JSON.stringify({
						status: 400,
						message: 'Invalid Download ID',
					}),
				);
				return response.end();
			}

			if (runningDownload.finished) {
				response.writeHead(200, {
					'Content-Type': Util.getContentType(runningDownload.path),
				});
				Fs.createReadStream(runningDownload.path).pipe(response);
				response.end();
			} else {
				response.writeHead(200, {
					'Content-Type': 'application/json',
				});
				response.write(
					JSON.stringify({
						url: runningDownload.url,
						videos: runningDownload.videos,
						finished: runningDownload.finished,
					}),
				);
				response.end();
			}
		}
	}
}

module.exports = Route;
