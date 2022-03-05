const { IncomingMessage, ServerResponse } = require('http');
const { URL } = require('url');
const BaseRoute = require('../../../BaseRoute');
const Util = require('../../../Util');
const Fs = require('fs');
const Path = require('path');
const PlayDl = require('play-dl');

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
				currentVideo: null,
				progress: 0,
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

			switch (urlType) {
				case 'yt_video': {
					const info = await PlayDl.video_info(youtubeURL);
					const filename = `${info.video_details.title
						.replace(/[^\w\s\(\)\[\]-]/g, ' ')
						.replace(/ +/g, ' ')}.mp3`;

					Util.youtubeDownloads.get(downloadId).currentVideo =
						info.video_details.title;

					const writeStream = Fs.createWriteStream(Path.join(path, filename));

					writeStream
						.on('open', async () => {
							(await PlayDl.stream(youtubeURL)).stream
								.on('progress', (chunkLength, downloadedBytes, totalBytes) => {
									Util.youtubeDownloads.get(downloadId).progress =
										downloadedBytes / totalBytes;
								})
								.on('finish', () => {
									Util.youtubeDownloads.get(downloadId).finished = true;
									Util.youtubeDownloads.get(downloadId).filename = filename;
									Util.youtubeDownloads.get(downloadId).path = Path.join(
										path,
										filename,
									);
								})
								.pipe(writeStream);
						})
						.on('error', console.error);
					break;
				}

				case 'yt_playlist': {
					const playlistInfo = await PlayDl.playlist_info(youtubeURL);
					const dirname = `${playlistInfo.title
						.replace(/[^\w\s\(\)\[\]-]/g, ' ')
						.replace(/ +/g, ' ')}.mp3`;
					Fs.mkdirSync(Path.join(path, dirname));

					const videos = await playlistInfo.all_videos();

					for (const video of videos) {
						const info = await PlayDl.video_info(video.url);
						const filename = `${info.video_details.title
							.replace(/[^\w\s\(\)\[\]-]/g, ' ')
							.replace(/ +/g, ' ')}.mp3`;

						Util.youtubeDownloads.get(downloadId).currentVideo =
							info.video_details.title;

						const writeStream = Fs.createWriteStream(
							Path.join(path, dirname, filename),
						);

						await new Promise((resolve, reject) => {
							writeStream
								.on('open', async () => {
									(await PlayDl.stream(video.url)).stream
										.on(
											'progress',
											(chunkLength, downloadedBytes, totalBytes) => {
												Util.youtubeDownloads.get(downloadId).progress =
													downloadedBytes / totalBytes;
											},
										)
										.on('finish', async () => {
											if (
												Util.youtubeDownloads.get(downloadId).currentVideo ===
												videos[playlistInfo.videoCount].title
											) {
												await Util.zipDirectory(
													Path.join(path, dirname),
													`${Path.join(path, dirname)}.zip`,
												);

												Util.youtubeDownloads.get(downloadId).finished = true;
												Util.youtubeDownloads.get(
													downloadId,
												).filename = `${dirname}.zip`;
												Util.youtubeDownloads.get(
													downloadId,
												).path = `${Path.join(path, dirname)}.zip`;
											}

											resolve();
										})
										.pipe(writeStream);
								})
								.on('error', console.error);
						});
					}
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

			response.writeHead(200, {
				'Content-Type': 'application/json',
			});
			response.write(
				JSON.stringify({
					url: runningDownload.url,
					current_video: runningDownload.currentVideo,
					progress: runningDownload.progress,
					finished: runningDownload.finished,
				}),
			);
			response.end();
		}
	}
}

module.exports = Route;
