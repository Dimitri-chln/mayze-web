import { getCookie } from '../modules/cookie.mjs';

const localePicker = document.getElementById('locale-picker');
const translationsSection = document.getElementById('translations');

fetch(`api/translations?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const translations = await res.json();

	addElements(translationsSection, translations, localePicker.value);

	localePicker.addEventListener('change', () => {
		while (translationsSection.firstChild) {
			translationsSection.removeChild(translationsSection.lastChild);
		}

		addElements(translationsSection, translations, localePicker.value);
	});
});

/**
 * @param {HTMLElement} parent
 * @param {object} data
 * @param {string} locale
 * @param {number} [depth]
 * @param {string} [path]
 */
function addElements(parent, data, locale, depth = 0, path = '') {
	if (data.default && data.translations) {
		const group = document.createElement('div');
		group.classList.add('translations-group');
		if (depth > 0) group.style.display = 'none';
		parent.appendChild(group);

		const defaultText = document.createElement('p');
		defaultText.innerHTML = data.default;
		group.appendChild(defaultText);

		const pathHidden = document.createElement('input');
		pathHidden.type = 'hidden';
		pathHidden.value = path;
		group.appendChild(pathHidden);

		const translationText = document.createElement('input');
		translationText.type = 'text';
		translationText.placeholder = 'Text translation';
		translationText.value = data.translations[locale];
		group.appendChild(translationText);

		translationText.addEventListener('change', () => {
			const changedText = translationText.previousElementSibling.value;

			fetch(
				`api/translations?token=${getCookie('token')}&name=${encodeURIComponent(
					changedText,
				)}&locale=${locale}&translation=${encodeURIComponent(translationText.value || 'NULL')}`,
				{
					method: 'POST',
				},
			);
		});
	} else {
		for (const key of Object.keys(data).sort((a, b) => a.localeCompare(b))) {
			const group = document.createElement('div');
			group.classList.add('translations-group');
			if (depth > 0) group.style.display = 'none';
			parent.appendChild(group);

			const groupHeader = document.createElement('div');
			groupHeader.classList.add('translations-group-header');
			group.appendChild(groupHeader);

			const groupOpen = document.createElement('div');
			groupOpen.innerHTML = '>';
			groupHeader.appendChild(groupOpen);

			const groupName = document.createElement('div');
			groupName.innerHTML = key.replace(/^./, (a) => a.toUpperCase());
			groupHeader.appendChild(groupName);

			groupHeader.addEventListener('click', () => {
				const closed = groupOpen.innerHTML === '&gt;';

				groupOpen.innerHTML = closed ? 'v' : '>';

				for (const child of group.children) {
					if (child.classList.contains('translations-group')) child.style.display = closed ? 'block' : 'none';
				}
			});

			addElements(group, data[key], locale, depth + 1, path ? `${path}.${key}` : key);
		}
	}
}
