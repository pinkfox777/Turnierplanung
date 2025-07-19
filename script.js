document.addEventListener('DOMContentLoaded', () => {
    const placesOptions = ['Springplatz', 'Dressurplatz', 'Halle', 'Anderes'];

    function isComplete(event) {
        if (!event.date || !event.location || !event.cameramen || !event.cameramen.length) return false;
        if (event.cameramen.some(cm => !cm.name || !cm.place || !cm.set)) return false;
        if (typeof event.hotel === 'undefined') return false;
        if (event.hotel && !event.hotelName) return false;
        if (typeof event.verpflegung === 'undefined') return false;
        if (typeof event.abloesung === 'undefined') return false;
        if (event.abloesung && !event.abloesungName) return false;
        return true;
    }

    function getLocalData(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    function setLocalData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    function loadOverview() {
        const events = getLocalData('events');
        console.log('Loaded events:', events); // Debug: Überprüfe, ob Termine geladen werden
        const today = new Date();
        const upcoming = events.filter(e => new Date(e.date) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10);
        const archive = events.filter(e => new Date(e.date) < today).sort((a, b) => new Date(b.date) - new Date(a.date));

        const overview = document.getElementById('overview');
        overview.innerHTML = '<h2>Nächste Termine</h2>';
        upcoming.forEach(ev => {
            const div = document.createElement('div');
            div.className = 'event';
            const status = document.createElement('div');
            status.className = `status ${isComplete(ev) ? 'green' : 'red'}`;
            div.appendChild(status);
            div.innerHTML += `<span>${ev.date} - ${ev.location}</span>`;
            div.onclick = () => showDetail(ev);
            overview.appendChild(div);
        });

        const archiveList = document.getElementById('archive-list');
        archiveList.innerHTML = '';
        archive.forEach(ev => {
            const li = document.createElement('li');
            li.className = 'event';
            const status = document.createElement('div');
            status.className = `status ${isComplete(ev) ? 'green' : 'red'}`;
            li.appendChild(status);
            li.innerHTML += `<span>${ev.date} - ${ev.location}</span>`;
            li.onclick = () => showDetail(ev);
            archiveList.appendChild(li);
        });
    }

    function getCameramen() {
        return getLocalData('cameramen');
    }

    function getLocations() {
        return getLocalData('locations');
    }

    function showDetail(event = {}) {
        const modal = document.getElementById('detail-modal');
        modal.style.display = 'block';
        const form = document.getElementById('event-form');
        form.innerHTML = '';

        addInput(form, 'date', 'Datum', 'date', event.date || '');

        const locs = getLocations();
        addSelect(form, 'location', 'Ort', locs, event.location || '');

        const camSection = document.createElement('section');
        camSection.innerHTML = '<h3>Kameraleute</h3>';
        event.cameramen = event.cameramen || [{ name: '', place: '', set: '' }];
        const camNames = getCameramen().map(c => c.name);
        event.cameramen.forEach((cm, i) => {
            const group = document.createElement('div');
            addSelect(group, `cam-name-${i}`, 'Kameramann', camNames, cm.name);
            addSelect(group, `cam-place-${i}`, 'Platz', placesOptions, cm.place, true);
            addInput(group, `cam-set-${i}`, 'Set (1-20)', 'number', cm.set);
            camSection.appendChild(group);
        });

        const addCamBtn = document.createElement('button');
        addCamBtn.innerText = 'Weiteren Kameramann hinzufügen';
        addCamBtn.onclick = () => {
            const i = event.cameramen.length;
            const group = document.createElement('div');
            addSelect(group, `cam-name-${i}`, 'Kameramann', camNames, '');
            addSelect(group, `cam-place-${i}`, 'Platz', placesOptions, '', true);
            addInput(group, `cam-set-${i}`, 'Set (1-20)', 'number', '');
            camSection.insertBefore(group, addCamBtn);
            event.cameramen.push({ name: '', place: '', set: '' });
        };
        camSection.appendChild(addCamBtn);
        form.appendChild(camSection);

        // Hotel Option
        const hotelGroup = document.createElement('div');
        hotelGroup.className = 'option-group';
        hotelGroup.innerHTML = '<label>Hotel?</label>';
        const hotelJa = document.createElement('button');
        hotelJa.className = 'yes';
        hotelJa.innerText = 'Ja';
        hotelJa.onclick = () => toggleButton(hotelJa, hotelNein, 'hotel', true, hotelGroup);
        const hotelNein = document.createElement('button');
        hotelNein.className = 'no';
        hotelNein.innerText = 'Nein';
        hotelNein.onclick = () => toggleButton(hotelNein, hotelJa, 'hotel', false, hotelGroup);
        hotelGroup.appendChild(hotelJa);
        hotelGroup.appendChild(hotelNein);
        if (event.hotel === true) {
            toggleButton(hotelJa, hotelNein, 'hotel', true, hotelGroup);
            hotelGroup.querySelector('#hotel-name').value = event.hotelName || '';
        } else if (event.hotel === false) {
            toggleButton(hotelNein, hotelJa, 'hotel', false, hotelGroup);
        }
        form.appendChild(hotelGroup);

        // Ablösung Option
        const abloesungGroup = document.createElement('div');
        abloesungGroup.className = 'option-group';
        abloesungGroup.innerHTML = '<label>Ablösung?</label>';
        const abloesungJa = document.createElement('button');
        abloesungJa.className = 'yes';
        abloesungJa.innerText = 'Ja';
        abloesungJa.onclick = () => toggleButton(abloesungJa, abloesungNein, 'abloesung', true, abloesungGroup);
        const abloesungNein = document.createElement('button');
        abloesungNein.className = 'no';
        abloesungNein.innerText = 'Nein';
        abloesungNein.onclick = () => toggleButton(abloesungNein, abloesungJa, 'abloesung', false, abloesungGroup);
        abloesungGroup.appendChild(abloesungJa);
        abloesungGroup.appendChild(abloesungNein);
        if (event.abloesung === true) {
            toggleButton(abloesungJa, abloesungNein, 'abloesung', true, abloesungGroup);
            abloesungGroup.querySelector('#abloesung-name').value = event.abloesungName || '';
        } else if (event.abloesung === false) {
            toggleButton(abloesungNein, abloesungJa, 'abloesung', false, abloesungGroup);
        }
        form.appendChild(abloesungGroup);

        // Verpflegung Option
        const verpflegungGroup = document.createElement('div');
        verpflegungGroup.className = 'option-group';
        verpflegungGroup.innerHTML = '<label>Verpflegung?</label>';
        const verpflegungJa = document.createElement('button');
        verpflegungJa.className = 'yes';
        verpflegungJa.innerText = 'Ja';
        verpflegungJa.onclick = () => toggleButton(verpflegungJa, verpflegungNein, 'verpflegung', true, verpflegungGroup);
        const verpflegungNein = document.createElement('button');
        verpflegungNein.className = 'no';
        verpflegungNein.innerText = 'Nein';
        verpflegungNein.onclick = () => toggleButton(verpflegungNein, verpflegungJa, 'verpflegung', false, verpflegungGroup);
        verpflegungGroup.appendChild(verpflegungJa);
        verpflegungGroup.appendChild(verpflegungNein);
        if (event.verpflegung === true) {
            toggleButton(verpflegungJa, verpflegungNein, 'verpflegung', true, verpflegungGroup);
        } else if (event.verpflegung === false) {
            toggleButton(verpflegungNein, verpflegungJa, 'verpflegung', false, verpflegungGroup);
        }
        form.appendChild(verpflegungGroup);

        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Speichern';
        saveBtn.onclick = () => saveEvent(event.id, form);
        form.appendChild(saveBtn);
    }

    function toggleButton(activeBtn, inactiveBtn, option, value, group) {
        if (activeBtn.classList.contains('active')) {
            activeBtn.classList.remove('active');
            group.dataset[option] = undefined;
            let extraField = group.querySelector(`#${option}-name`);
            if (extraField) {
                extraField.previousSibling.remove(); // Label
                extraField.remove();
            }
            return;
        }
        activeBtn.classList.add('active');
        inactiveBtn.classList.remove('active');
        group.dataset[option] = value;
        let extraField = group.querySelector(`#${option}-name`);
        if (value && !extraField && (option === 'hotel' || option === 'abloesung')) {
            addInput(group, `${option}-name`, `${option.charAt(0).toUpperCase() + option.slice(1)} Name`, 'text', '');
        } else if (!value && extraField) {
            extraField.previousSibling.remove(); // Label
            extraField.remove();
        }
    }

    function saveEvent(id, form) {
        const data = getLocalData('events');
        const newData = {
            date: form.querySelector('#date').value,
            location: form.querySelector('#location').value,
            cameramen: [],
            hotel: form.querySelector('.option-group[data-hotel]') ? form.querySelector('.option-group[data-hotel]').dataset.hotel === 'true' : undefined,
            hotelName: form.querySelector('#hotel-name') ? form.querySelector('#hotel-name').value : '',
            abloesung: form.querySelector('.option-group[data-abloesung]') ? form.querySelector('.option-group[data-abloesung]').dataset.abloesung === 'true' : undefined,
            abloesungName: form.querySelector('#abloesung-name') ? form.querySelector('#abloesung-name').value : '',
            verpflegung: form.querySelector('.option-group[data-verpflegung]') ? form.querySelector('.option-group[data-verpflegung]').dataset.verpflegung === 'true' : undefined
        };

        const camGroups = form.querySelectorAll('section div');
        camGroups.forEach((group, i) => {
            const name = group.querySelector(`#cam-name-${i}`).value;
            let place = group.querySelector(`#cam-place-${i}`).value;
            if (place === 'Anderes') place = group.querySelector('input[placeholder="Custom Platz"]').value;
            const set = group.querySelector(`#cam-set-${i}`).value;
            if (name) newData.cameramen.push({ name, place, set });
        });

        if (id) {
            const index = data.findIndex(e => e.id === id);
            data[index] = { ...newData, id };
        } else {
            newData.id = Date.now().toString();
            data.push(newData);
        }

        setLocalData('events', data);
        document.getElementById('detail-modal').style.display = 'none';
        loadOverview();
    }

    function addInput(parent, id, labelText, type, value) {
        const label = document.createElement('label');
        label.innerText = labelText;
        const input = document.createElement('input');
        input.id = id;
        input.type = type;
        input.value = value;
        parent.appendChild(label);
        parent.appendChild(input);
    }

    function addSelect(parent, id, labelText, options, value, allowCustom = false) {
        const label = document.createElement('label');
        label.innerText = labelText;
        const select = document.createElement('select');
        select.id = id;
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.text = opt;
            if (opt === value) option.selected = true;
            select.appendChild(option);
        });
        if (allowCustom) {
            const customOpt = document.createElement('option');
            customOpt.value = 'Anderes';
            customOpt.text = 'Anderes';
            select.appendChild(customOpt);
            const customInput = document.createElement('input');
            customInput.placeholder = 'Custom Platz';
            customInput.style.display = select.value === 'Anderes' ? 'block' : 'none';
            select.onchange = () => customInput.style.display = (select.value === 'Anderes') ? 'block' : 'none';
            if (value && !options.includes(value)) {
                select.value = 'Anderes';
                customInput.value = value;
                customInput.style.display = 'block';
            }
            parent.appendChild(customInput);
        }
        parent.appendChild(label);
        parent.appendChild(select);
    }

    window.addCameraman = function() {
        const name = document.getElementById('cam-name').value;
        const location = document.getElementById('cam-location').value;
        if (name && location) {
            const cams = getLocalData('cameramen');
            cams.push({ id: Date.now().toString(), name, location });
            setLocalData('cameramen', cams);
            loadDBLists();
        }
    }

    window.addLocation = function() {
        const name = document.getElementById('loc-name').value;
        if (name) {
            const locs = getLocalData('locations');
            locs.push(name);
            setLocalData('locations', locs);
            loadDBLists();
        }
    }

    function loadDBLists() {
        const camList = document.getElementById('cam-list');
        camList.innerHTML = '';
        const cams = getLocalData('cameramen');
        cams.forEach(cam => {
            const li = document.createElement('li');
            li.innerText = `${cam.name} (${cam.location})`;
            const delBtn = document.createElement('button');
            delBtn.innerText = 'Löschen';
            delBtn.onclick = () => {
                const newCams = cams.filter(c => c.id !== cam.id);
                setLocalData('cameramen', newCams);
                loadDBLists();
            };
            li.appendChild(delBtn);
            camList.appendChild(li);
        });

        const locList = document.getElementById('loc-list');
        locList.innerHTML = '';
        const locs = getLocalData('locations');
        locs.forEach(name => {
            const li = document.createElement('li');
            li.innerText = name;
            const delBtn = document.createElement('button');
            delBtn.innerText = 'Löschen';
            delBtn.onclick = () => {
                const newLocs = locs.filter(l => l !== name);
                setLocalData('locations', newLocs);
                loadDBLists();
            };
            li.appendChild(delBtn);
            locList.appendChild(li);
        });
    }

    document.querySelectorAll('.close').forEach(close => {
        close.onclick = () => close.parentElement.parentElement.style.display = 'none';
    });

    document.getElementById('add-event').onclick = () => showDetail({});
    document.getElementById('manage-db').onclick = () => {
        document.getElementById('db-modal').style.display = 'block';
        loadDBLists();
    };
    document.getElementById('show-archive').onclick = () => document.getElementById('archive-modal').style.display = 'block';

    loadOverview();
});