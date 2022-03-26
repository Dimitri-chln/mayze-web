import { getCookie } from '../modules/cookie.mjs';

const localePicker = document.getElementById('locale-picker');
const translationsSection = document.getElementById('translations');

fetch(`api/translations?token=${getCookie('token')}`).then(async (res) => {
	const translations = await res.json();
	console.log(translations);

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
 */
function addElements(parent, data, locale, depth = 0) {
	if (data.default && data.translations) {
		const defaultText = document.createElement('p');
		defaultText.innerHTML = data.default;
		parent.appendChild(defaultText);

		const translationText = document.createElement('input');
		translationText.type = 'text';
		translationText.placeholder = 'Text translation';
		translationText.value = data.translations[locale];
		parent.appendChild(translationText);
	} else {
		for (const key of Object.keys(data)) {
			const div = document.createElement('div');
			div.classList.add('translations-group');
			if (depth > 0) div.style.display = 'none';
			parent.appendChild(div);

			const groupName = document.createElement('h2');
			groupName.innerHTML = key.replace(/^./, (a) => a.toUpperCase());
			div.appendChild(groupName);

			groupName.addEventListener('click', () => {
				for (const child of div.children) {
					if (child.tagName.toLowerCase() === 'div')
						child.style.display =
							child.style.display === 'none' ? 'block' : 'none';
				}
			});

			addElements(div, data[key], locale, depth + 1);
		}
	}
}
