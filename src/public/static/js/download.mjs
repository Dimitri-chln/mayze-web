import { getCookie } from '../modules/cookie.mjs';

const searchParams = new URLSearchParams(location.search);

if (searchParams.has('url')) {
	document.getElementById('download-form-url').value = searchParams.get('url');
}

const downloadButton = document.getElementById('download-form-submit');
const currentVideo = document.getElementById('current-video');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress-bar-progress');

downloadButton.addEventListener('click', (event) => {
	event.preventDefault();

	downloadButton.disabled = true;
	downloadButton.style.cursor = 'not-allowed';
	progressBar.style.display = 'flex';

	fetch(
		`/api/download?token=${getCookie('token')}&url=${
			document.getElementById('download-form-url').value
		}`,
		{
			method: 'GET',
		},
	).then(async (res) => {
		const body = await res.json();
		const downloadId = body.download_id;

		(function update() {
			fetch(
				`/api/download?token=${getCookie('token')}&download_id=${downloadId}`,
				{
					method: 'GET',
				},
			).then(async (res) => {
				const body = await res.json();

				console.log(body);

				currentVideo.innerHTML = body.current_video;
				progress.style.width = `${body.progress * 100}%`;

				if (!body.finished) setTimeout(update, 1_000);
			});
		})();
	});
});
