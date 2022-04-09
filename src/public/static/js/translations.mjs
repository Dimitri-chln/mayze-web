import { getCookie } from '../modules/cookie.mjs';

const localePicker = document.getElementById('locale-picker');
const openAllButton = document.getElementById('open-all');
const closeAllButton = document.getElementById('close-all');
const translationsSection = document.getElementById('translations');

fetch(`api/translations?token=${getCookie('token')}`, {
	method: 'GET',
}).then(async (res) => {
	const translations = await res.json();

	addElements(translationsSection, translations, localePicker.value);

	localePicker.addEventListener('change', () => {
		openCloseAllButton.value = 'Open all sections';

		while (translationsSection.firstChild) {
			translationsSection.removeChild(translationsSection.lastChild);
		}

		addElements(translationsSection, translations, localePicker.value);
	});

	openAllButton.addEventListener('click', () => {
		for (const child of translationsSection.children) openOrCloseGroup(child, true, true);
	});

	closeAllButton.addEventListener('click', () => {
		for (const child of translationsSection.children) openOrCloseGroup(child, false, true);
	});
});

/**
 * @param {HTMLElement} parent
 * @param {object} data
 * @param {string} locale
 * @param {number} [depth]
 * @param {string} [path]
 * @returns {boolean}
 */
function addElements(parent, data, locale, depth = 0, path = '') {
	if (data.default && data.translations) {
		const group = document.createElement('div');
		group.classList.add('translations-group');
		if (depth > 0) group.style.display = 'none';
		parent.appendChild(group);

		const defaultText = document.createElement('p');
		defaultText.innerText = data.default;
		group.appendChild(defaultText);

		const translationText = document.createElement('input');
		translationText.type = 'text';
		translationText.placeholder = 'Text translation';
		translationText.value = data.translations[locale];
		group.appendChild(translationText);

		const pathHidden = document.createElement('input');
		pathHidden.type = 'hidden';
		pathHidden.value = path;
		group.appendChild(pathHidden);

		translationText.addEventListener('change', () => {
			const changedText = translationText.nextElementSibling.value;

			fetch(
				`api/translations?token=${getCookie('token')}&name=${encodeURIComponent(
					changedText,
				)}&locale=${locale}&translation=${encodeURIComponent(translationText.value || 'NULL')}`,
				{
					method: 'POST',
				},
			);
		});

		const hasEmptyFields = data.translations[locale] === null;
		if (hasEmptyFields) group.classList.add('has-empty-fields');
		return hasEmptyFields;
	} else {
		let hasEmptyFields = false;

		for (const key of Object.keys(data) /*.sort((a, b) => a.localeCompare(b))*/) {
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
			groupName.innerHTML = key;
			groupHeader.appendChild(groupName);

			groupHeader.addEventListener('click', () => {
				const open = groupOpen.innerText === '>';
				openOrCloseGroup(group, open, false);
			});

			hasEmptyFields =
				addElements(group, data[key], locale, depth + 1, path ? `${path}.${key}` : key) || hasEmptyFields;

			if (hasEmptyFields) group.classList.add('has-empty-fields');
		}

		return hasEmptyFields;
	}
}

/**
 * @param {HTMLElement} group
 * @param {boolean} open
 * @param {boolean} recursive
 */
function openOrCloseGroup(group, open = true, recursive = false) {
	const groupHeader = group.children.item(0);
	const groupOpen = groupHeader.children.item(0);
	if (!groupOpen) return;

	groupOpen.innerText = open ? '-' : '>';

	for (const child of group.children) {
		if (child.classList.contains('translations-group')) {
			child.style.display = open ? 'block' : 'none';
			if (recursive) openOrCloseGroup(child, open, true);
		}
	}
}
