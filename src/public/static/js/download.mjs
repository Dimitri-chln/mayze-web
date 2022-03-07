import { getCookie } from '../modules/cookie.mjs';

const searchParams = new URLSearchParams(location.search);

if (searchParams.has('url')) {
	document.getElementById('download-form-url').value = searchParams.get('url');
}

const progressSection = document.getElementById('progress-info');
const downloadButton = document.getElementById('download-form-submit');

downloadButton.addEventListener('click', (event) => {
	event.preventDefault();

	downloadButton.disabled = true;
	downloadButton.style.cursor = 'not-allowed';
	document.getElementById('loading').style.display = 'inline-block';

	fetch(
		`/api/download?token=${getCookie('token')}&url=${
			document.getElementById('download-form-url').value
		}`,
		{
			method: 'GET',
		},
	).then(async (res) => {
		if (res.status !== 200) {
			document.getElementById('loading').style.display = 'none';
			return alert('Le lien est invalide');
		}
		const body = await res.json();
		const downloadId = body.download_id;

		fetch(
			`/api/download?token=${getCookie('token')}&download_id=${downloadId}`,
			{
				method: 'GET',
			},
		).then(async (res) => {
			if (res.status !== 200) {
				document.getElementById('loading').style.display = 'none';
				return alert("Quelque chose s'est mal passé en téléchargeant la vidéo");
			}
			const body = await res.json();

			for (const video of body.videos) {
				const progressDiv = document.createElement('div');
				const progressText = document.createElement('p');
				progressText.classList.add('progress-video');
				progressText.innerHTML = video.name;
				progressDiv.appendChild(progressText);
				const progressBar = document.createElement('div');
				progressBar.classList.add('progress-bar');
				const progressBarProgress = document.createElement('div');
				progressBarProgress.classList.add('progress-bar-progress');
				progressBar.appendChild(progressBarProgress);
				progressDiv.appendChild(progressBar);

				progressSection.appendChild(progressDiv);
			}

			document.getElementById('loading').style.display = 'none';

			(function update() {
				fetch(
					`/api/download?token=${getCookie('token')}&download_id=${downloadId}`,
					{
						method: 'GET',
					},
				).then(async (res) => {
					if (res.status !== 200) {
						return alert(
							"Quelque chose s'est mal passé en téléchargeant la vidéo",
						);
					}
					const body = await res.json();

					for (let i = 0; i < body.videos.length; i++) {
						const video = body.videos[i];
						const progress = progressSection.children
							.item(i)
							.children.item(1)
							.children.item(0);

						progress.style.width = `${
							video.finished ? 100 : Math.round(video.progress * 100)
						}%`;

						if (video.finished) progress.style.background = '#46e083';
					}

					if (!body.finished) return setTimeout(update, 1_000);

					const downloadButton = document.getElementById('download-button');
					downloadButton.href = `${location.origin}/static/downloads/${body.filename}`;
					downloadButton.download =
						body.name + body.filename.match(/\.\w+$/)[0];
					downloadButton.children.item(0).style.display = 'block';
				});
			})();
		});
	});
});
